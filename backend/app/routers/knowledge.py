from fastapi import APIRouter, Query
from typing import List, Dict, Optional
from app.knowledge import (
    get_growth_stages,
    get_diseases,
    get_nutrient_deficiencies
)
from app.utils.search_engine import smart_search, expand_keywords, highlight_text

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

@router.get("/growth-stages")
async def get_growth_stages_api():
    stages = get_growth_stages()
    return {
        "status": "success",
        "data": stages
    }

@router.get("/diseases")
async def get_diseases_api():
    diseases = get_diseases()
    return {
        "status": "success",
        "data": diseases
    }

@router.get("/nutrients")
async def get_nutrients_api():
    nutrients = get_nutrient_deficiencies()
    return {
        "status": "success",
        "data": nutrients
    }

@router.get("/search")
async def search_knowledge(q: str = Query(..., min_length=1, description="搜索关键词")):
    """
    智能搜索接口 - 支持同义词匹配、关键词扩展、语义搜索
    """
    results = {
        "growth_stages": [],
        "diseases": [],
        "nutrients": []
    }
    
    # 获取扩展的关键词（用于高亮）
    expanded_keywords = expand_keywords(q.strip())
    
    # 搜索生长阶段（降低阈值以匹配更多结果）
    stages = get_growth_stages()
    stage_results = smart_search(
        query=q,
        data_list=stages,
        search_fields=['stage', 'temp_range', 'humidity_air', 'humidity_soil', 'key_management', 'description'],
        min_score=0.5  # 降低阈值，支持模糊匹配
    )
    # 移除内部评分字段，添加高亮文本
    for item in stage_results:
        item.pop('_search_score', None)
    results["growth_stages"] = stage_results
    
    # 搜索病害（降低阈值）
    diseases = get_diseases()
    disease_results = smart_search(
        query=q,
        data_list=diseases,
        search_fields=['name', 'type', 'symptoms', 'prevention', 'treatment', 'severity'],
        min_score=0.5  # 降低阈值，支持模糊匹配
    )
    for item in disease_results:
        item.pop('_search_score', None)
    results["diseases"] = disease_results
    
    # 搜索营养缺乏（降低阈值）
    nutrients = get_nutrient_deficiencies()
    nutrient_results = smart_search(
        query=q,
        data_list=nutrients,
        search_fields=['name', 'type', 'symptoms', 'prevention', 'treatment'],
        min_score=0.5  # 降低阈值，支持模糊匹配
    )
    for item in nutrient_results:
        item.pop('_search_score', None)
    results["nutrients"] = nutrient_results
    
    # 统计结果数量
    total_results = (
        len(results["growth_stages"]) + 
        len(results["diseases"]) + 
        len(results["nutrients"])
    )
    
    return {
        "status": "success",
        "keyword": q,
        "expanded_keywords": list(expanded_keywords)[:10],  # 返回前 10 个扩展词
        "total_results": total_results,
        "data": results
    }
