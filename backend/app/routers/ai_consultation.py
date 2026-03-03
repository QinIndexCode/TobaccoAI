"""
AI 问诊路由器 - 提供智能诊断和问诊服务
"""
from fastapi import APIRouter, Query, Body, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel

from app.services.ai_consultation import ai_consultation_service

router = APIRouter(prefix="/api/ai", tags=["AI 问诊"])


class ConsultationRequest(BaseModel):
    """问诊请求"""
    query: str
    user_id: Optional[str] = "default"


class ConsultationResponse(BaseModel):
    """问诊响应"""
    id: str
    query: str
    intent: str
    diagnosis: Dict
    timestamp: str


@router.post("/consult", response_model=ConsultationResponse)
async def ai_consultation(request: ConsultationRequest):
    """
    AI 智能问诊
    
    用户可以用自然语言描述问题，AI 会自动分析并提供诊断建议
    
    Examples:
        - "我的烟草叶子发黄怎么办"
        - "叶片上有黑色斑点是什么原因"
        - "如何防治花叶病"
        - "缺氮应该怎么施肥"
    """
    try:
        # 使用异步方法调用 LLM
        result = await ai_consultation_service.async_analyze_query(
            query=request.query,
            user_id=request.user_id
        )
        
        return {
            "id": result['id'],
            "query": result['query'],
            "intent": result['intent'],
            "diagnosis": result['diagnosis'],
            "timestamp": result['timestamp']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/consult/history")
async def get_consultation_history(
    user_id: str = Query("default", description="用户 ID"),
    limit: int = Query(10, ge=1, le=50, description="返回数量限制")
):
    """
    获取用户问诊历史
    """
    history = ai_consultation_service.get_consultation_history(user_id, limit)
    return {
        "status": "success",
        "data": history,
        "total": len(history)
    }


@router.get("/consult/context")
async def get_context(user_id: str = Query("default", description="用户 ID")):
    """
    获取用户当前上下文（最近 10 条问诊记录）
    """
    context = ai_consultation_service.get_context(user_id)
    return {
        "status": "success",
        "data": context
    }


@router.delete("/consult/context")
async def clear_context(user_id: str = Query("default", description="用户 ID")):
    """
    清除用户上下文
    """
    ai_consultation_service.clear_context(user_id)
    return {
        "status": "success",
        "message": "上下文已清除"
    }


@router.delete("/consult/history/{record_id}")
async def delete_consultation(
    record_id: str,
    user_id: str = Query("default", description="用户 ID")
):
    """
    删除单条问诊记录
    """
    success = ai_consultation_service.delete_consultation(user_id, record_id)
    if success:
        return {
            "status": "success",
            "message": "记录已删除"
        }
    else:
        raise HTTPException(status_code=404, detail="记录不存在")


@router.get("/quick-diagnosis/{symptom}")
async def quick_diagnosis(symptom: str):
    """
    快速诊断 - 根据症状关键词快速获取可能的病因
    
    Args:
        symptom: 症状关键词（如：发黄、黑斑、卷叶）
    """
    result = ai_consultation_service.analyze_query(
        query=f"烟草{symptom}是什么原因",
        user_id="quick"
    )
    
    return {
        "status": "success",
        "symptom": symptom,
        "diagnosis": result['diagnosis']
    }
