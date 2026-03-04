from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import json
import uuid
import os
import asyncio
from datetime import datetime
from pathlib import Path

from app.models.database import get_db, DiagnosisRecordDB
from app.schemas.diagnosis import (
    DiagnosisRequest,
    DiagnosisResponse,
    DiagnosisRecord,
    VLResult,
    LLMSuggestion,
    IssueItem
)
from app.services.ollama_service import ollama_service
from app.config import settings

router = APIRouter(prefix="/api", tags=["diagnosis"])

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024
MIN_IMAGES = 1
MAX_IMAGES = 3
API_TIMEOUT = 180  # 增加到 180 秒，因为 AI 诊断可能需要较长时间


def validate_image_file(file: UploadFile) -> tuple[bool, str]:
    if not file.filename:
        return False, "文件名不能为空"
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"不支持的图片格式: {file_ext}，支持的格式: {', '.join(ALLOWED_EXTENSIONS)}"
    
    return True, ""


async def validate_image_size(file: UploadFile) -> tuple[bool, str, Optional[bytes]]:
    content = await file.read()
    await file.seek(0)
    
    if len(content) == 0:
        return False, "图片文件为空", None
    
    if len(content) > MAX_IMAGE_SIZE:
        size_mb = len(content) / (1024 * 1024)
        return False, f"图片文件过大: {size_mb:.2f}MB，最大允许: {MAX_IMAGE_SIZE / (1024 * 1024):.0f}MB", None
    
    return True, "", content


async def save_upload_file(file: UploadFile) -> str:
    is_valid, error_msg = validate_image_file(file)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    is_valid, error_msg, content = await validate_image_size(file)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / file_name
    
    # Use thread pool for file I/O to avoid blocking event loop
    await asyncio.to_thread(lambda: open(file_path, "wb").write(content))
    
    return str(file_path)


def build_knowledge_context(growth_stage: str, detected_issues: List[dict] = None) -> dict:
    from app.knowledge import (
        get_growth_stage_by_name,
        get_diseases,
        get_nutrient_deficiencies
    )
    
    knowledge = {
        "growth_stage_info": None,
        "related_diseases": [],
        "nutrient_info": []
    }
    
    stage_info = get_growth_stage_by_name(growth_stage)
    if stage_info:
        knowledge["growth_stage_info"] = stage_info
    
    all_diseases = get_diseases()
    knowledge["related_diseases"] = all_diseases[:5]
    
    if detected_issues:
        for issue in detected_issues:
            issue_name = issue.get("name", "")
            for disease in all_diseases:
                if disease["name"] == issue_name:
                    if disease not in knowledge["related_diseases"]:
                        knowledge["related_diseases"].insert(0, disease)
                    break
    
    knowledge["nutrient_info"] = get_nutrient_deficiencies()[:3]
    
    return knowledge


def parse_vl_result(vl_data: dict, growth_stage: str) -> VLResult:
    issues = []
    for issue in vl_data.get("issues", []):
        issues.append(IssueItem(
            type=issue.get("type", "未知"),
            name=issue.get("name", "未知问题"),
            symptoms=issue.get("symptoms", ""),
            severity=issue.get("severity", "未知"),
            confidence=issue.get("confidence", 0.0)
        ))
    
    return VLResult(
        growth_stage=vl_data.get("growth_stage", growth_stage),
        leaf_health=vl_data.get("leaf_health", 0),
        issues=issues,
        other_observations=vl_data.get("other_observations", "")
    )


def parse_llm_suggestion(suggestion_text: str) -> LLMSuggestion:
    default_suggestion = LLMSuggestion(
        irrigation="请根据土壤湿度适时灌溉，保持土壤湿润但不积水",
        fertilizer="建议根据生长阶段合理施肥，注意氮磷钾配比",
        pest_control="建议定期检查病虫害情况，发现问题及时处理",
        other_management="注意田间管理，保持良好的通风透光条件"
    )
    
    if not suggestion_text:
        return default_suggestion
    
    result = {
        "irrigation": default_suggestion.irrigation,
        "fertilizer": default_suggestion.fertilizer,
        "pest_control": default_suggestion.pest_control,
        "other_management": default_suggestion.other_management
    }
    
    sections = {
        "灌溉": "irrigation",
        "施肥": "fertilizer",
        "病虫害防治": "pest_control",
        "其他管理": "other_management",
        "其他": "other_management"
    }
    
    current_section = None
    current_content = []
    
    lines = suggestion_text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        found_section = None
        for key, field in sections.items():
            if key in line and (':' in line or '：' in line or '建议' in line):
                found_section = field
                break
        
        if found_section:
            if current_section and current_content:
                result[current_section] = ' '.join(current_content)
            current_section = found_section
            current_content = []
            
            for key in sections.keys():
                line = line.replace(key, '').replace(':', '').replace('：', '')
            line = line.strip()
            if line.startswith('建议'):
                line = line[2:].strip()
            if line:
                current_content.append(line)
        elif current_section:
            current_content.append(line)
    
    if current_section and current_content:
        result[current_section] = ' '.join(current_content)
    
    return LLMSuggestion(**result)


@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose(
    images: List[UploadFile] = File(...),
    date: str = Form(...),
    growth_stage: str = Form(...),
    temperature: float = Form(...),
    air_humidity: float = Form(...),
    soil_humidity: float = Form(...),
    soil_ph: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    if len(images) < MIN_IMAGES or len(images) > MAX_IMAGES:
        raise HTTPException(
            status_code=400, 
            detail=f"图片数量必须在{MIN_IMAGES}-{MAX_IMAGES}张之间，当前上传了{len(images)}张"
        )
    
    is_ollama_available = await ollama_service.check_ollama_status()
    if not is_ollama_available:
        raise HTTPException(
            status_code=503,
            detail="Ollama服务暂时不可用，请确保Ollama服务正在运行（默认地址: http://localhost:11434）"
        )
    
    image_paths = []
    for image in images:
        try:
            path = await save_upload_file(image)
            image_paths.append(path)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"图片保存失败: {str(e)}")
    
    env_data = {
        "temperature": temperature,
        "humidity": air_humidity,
        "soil_moisture": soil_humidity,
        "soil_ph": soil_ph,
        "growth_stage": growth_stage,
        "date": date,
        "notes": notes
    }
    
    knowledge = build_knowledge_context(growth_stage)
    
    try:
        diagnosis_result = await asyncio.wait_for(
            ollama_service.full_diagnosis(image_paths, env_data, knowledge),
            timeout=API_TIMEOUT
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"诊断请求超时（超过{API_TIMEOUT}秒），请稍后重试"
        )
    except Exception as e:
        error_msg = str(e)
        print(f"诊断错误: {error_msg}")
        if "Ollama API error" in error_msg:
            raise HTTPException(
                status_code=502,
                detail="Ollama服务响应错误，请检查服务状态"
            )
        raise HTTPException(
            status_code=500,
            detail="诊断过程发生错误，请稍后重试"
        )
    
    vl_data = diagnosis_result.get("image_analysis", {})
    suggestion_text = diagnosis_result.get("suggestion", "")
    
    vl_result = parse_vl_result(vl_data, growth_stage)
    
    llm_suggestion = parse_llm_suggestion(suggestion_text)
    
    diagnosis_id = str(uuid.uuid4())
    created_at = datetime.utcnow()
    
    db_record = DiagnosisRecordDB(
        id=diagnosis_id,
        image_paths=json.dumps(image_paths),
        date=date,
        growth_stage=growth_stage,
        temperature=temperature,
        air_humidity=air_humidity,
        soil_humidity=soil_humidity,
        soil_ph=soil_ph,
        notes=notes,
        vl_result=vl_result.model_dump_json(),
        llm_suggestion=llm_suggestion.model_dump_json(),
        created_at=created_at
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    
    return DiagnosisResponse(
        status="success",
        diagnosis_id=diagnosis_id,
        vl_result=vl_result,
        llm_suggestion=llm_suggestion,
        created_at=created_at
    )


from sqlalchemy.future import select

@router.get("/history", response_model=List[DiagnosisRecord])
async def get_history(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    query = select(DiagnosisRecordDB).order_by(
        DiagnosisRecordDB.created_at.desc()
    ).offset(skip).limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()
    
    result_list = []
    for record in records:
        vl_result = VLResult(**json.loads(record.vl_result))
        llm_suggestion = LLMSuggestion(**json.loads(record.llm_suggestion))
        request_data = DiagnosisRequest(
            date=record.date,
            growth_stage=record.growth_stage,
            temperature=record.temperature,
            air_humidity=record.air_humidity,
            soil_humidity=record.soil_humidity,
            soil_ph=record.soil_ph,
            notes=record.notes
        )
        result_list.append(DiagnosisRecord(
            id=record.id,
            image_paths=json.loads(record.image_paths),
            request_data=request_data,
            vl_result=vl_result,
            llm_suggestion=llm_suggestion,
            created_at=record.created_at
        ))
    
    return result_list


@router.get("/history/{diagnosis_id}", response_model=DiagnosisRecord)
async def get_history_item(diagnosis_id: str, db: AsyncSession = Depends(get_db)):
    query = select(DiagnosisRecordDB).filter(
        DiagnosisRecordDB.id == diagnosis_id
    )
    result = await db.execute(query)
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="诊断记录不存在")
    
    vl_result = VLResult(**json.loads(record.vl_result))
    llm_suggestion = LLMSuggestion(**json.loads(record.llm_suggestion))
    request_data = DiagnosisRequest(
        date=record.date,
        growth_stage=record.growth_stage,
        temperature=record.temperature,
        air_humidity=record.air_humidity,
        soil_humidity=record.soil_humidity,
        soil_ph=record.soil_ph,
        notes=record.notes
    )
    
    return DiagnosisRecord(
        id=record.id,
        image_paths=json.loads(record.image_paths),
        request_data=request_data,
        vl_result=vl_result,
        llm_suggestion=llm_suggestion,
        created_at=record.created_at
    )


@router.delete("/history/{diagnosis_id}")
async def delete_history_item(diagnosis_id: str, db: AsyncSession = Depends(get_db)):
    query = select(DiagnosisRecordDB).filter(
        DiagnosisRecordDB.id == diagnosis_id
    )
    result = await db.execute(query)
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="诊断记录不存在")
    
    image_paths = json.loads(record.image_paths)
    for image_path in image_paths:
        try:
            # 验证文件路径是否在允许的目录范围内
            abs_path = os.path.abspath(image_path)
            abs_upload_dir = os.path.abspath(str(UPLOAD_DIR))
            if not abs_path.startswith(abs_upload_dir):
                print(f"非法文件路径: {image_path}")
                continue
            if os.path.exists(abs_path):
                # Use thread pool for file deletion
                await asyncio.to_thread(os.remove, abs_path)
        except Exception as e:
            print(f"删除图片文件失败: {image_path}, 错误: {e}")
    
    await db.delete(record)
    await db.commit()
    
    return {"status": "success", "message": "诊断记录已删除"}
