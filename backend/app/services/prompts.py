import json
from typing import Dict, Any, List


VL_SYSTEM_PROMPT = """你是一位专业的烟草病害识别专家。请仔细观察提供的烟草叶片图片，进行详细分析。

重要提示：
1. 如果叶片看起来健康，没有明显病斑，请如实报告"无明显病害"
2. 不要编造不存在的病害
3. 仔细观察叶片颜色、斑点、形状等特征
4. 如果无法确定具体病害，请说明"无法确定"

请严格按以下JSON格式输出，不要添加其他文字：
{
  "growth_stage": "判断的生长阶段（苗期/团棵期/旺长期/打顶期/成熟期）",
  "leaf_health": 0-100的数字评分,
  "issues": [
    {
      "type": "病害/虫害/缺素/生理问题/无明显问题",
      "name": "具体名称或'无明显病害'",
      "severity": "无/轻/中/重",
      "symptoms": "观察到的具体症状描述",
      "confidence": 0.0-1.0的置信度
    }
  ],
  "other_observations": "其他观察，如叶片颜色、光泽、完整性等"
}

注意：
- 健康叶片：leaf_health 应该 > 80，issues 应该报告"无明显病害"
- 病斑叶片：准确描述病斑特征，不要猜测不确定的病害名称
- 置信度 < 0.6 时，请说明"无法确定具体病害"""

VL_USER_PROMPT = "请仔细观察这张烟草叶片图片，客观描述叶片的健康状况和任何异常特征。"

LLM_SYSTEM_PROMPT = """你是一位专业的烟草种植顾问。基于图片分析结果、环境数据和知识库，为用户提供详细的诊断建议和解决方案。
请用专业但易懂的语言回答，结构清晰，建议具体可行。

请按以下格式输出建议：
灌溉：[灌溉建议]
施肥：[施肥建议]
病虫害防治：[病虫害防治建议]
其他管理：[其他管理建议]"""


def build_llm_prompt(vl_result: Dict[str, Any], env_data: Dict[str, Any], knowledge: Dict[str, Any]) -> str:
    prompt_parts = [
        "## 图片分析结果",
        "```json",
        json.dumps(vl_result, ensure_ascii=False, indent=2),
        "```",
        "",
    ]
    
    if env_data:
        prompt_parts.extend([
            "## 环境数据",
            f"- 温度: {env_data.get('temperature', '未知')}°C",
            f"- 空气湿度: {env_data.get('humidity', '未知')}%",
            f"- 土壤湿度: {env_data.get('soil_moisture', '未知')}%",
            f"- 土壤pH: {env_data.get('soil_ph', '未知')}",
            f"- 生长阶段: {env_data.get('growth_stage', '未知')}",
            "",
        ])
    
    if knowledge:
        growth_info = knowledge.get('growth_stage_info')
        if growth_info:
            prompt_parts.extend([
                "## 当前生长阶段参考信息",
                f"- 适宜温度: {growth_info.get('temp_range', '未知')}",
                f"- 适宜空气湿度: {growth_info.get('humidity_air', '未知')}",
                f"- 适宜土壤湿度: {growth_info.get('humidity_soil', '未知')}",
                f"- 关键管理要点: {growth_info.get('key_management', '未知')}",
                "",
            ])
        
        related_diseases = knowledge.get('related_diseases', [])
        if related_diseases:
            prompt_parts.extend([
                "## 相关病害信息",
            ])
            for disease in related_diseases[:3]:
                prompt_parts.extend([
                    f"### {disease.get('name', '未知病害')}",
                    f"- 类型: {disease.get('type', '未知')}",
                    f"- 症状: {disease.get('symptoms', '未知')}",
                    f"- 严重程度: {disease.get('severity', '未知')}",
                    f"- 预防方法: {disease.get('prevention', '未知')}",
                    f"- 治疗方法: {disease.get('treatment', '未知')}",
                    "",
                ])
    
    prompt_parts.extend([
        "## 请提供以下内容：",
        "请根据以上信息，提供具体的种植管理建议，包括灌溉、施肥、病虫害防治和其他管理措施。",
    ])
    
    return "\n".join(prompt_parts)


def build_vl_messages_for_ollama(image_descriptions: List[dict]) -> List[dict]:
    images_base64 = [img_desc.get("base64", "") for img_desc in image_descriptions]
    
    messages = [
        {
            "role": "system",
            "content": VL_SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": VL_USER_PROMPT,
            "images": images_base64
        }
    ]
    
    return messages


def build_vl_messages(image_descriptions: list) -> list:
    return build_vl_messages_for_ollama(image_descriptions)


def build_llm_messages(vl_result: Dict[str, Any], env_data: Dict[str, Any], knowledge: Dict[str, Any]) -> list:
    user_prompt = build_llm_prompt(vl_result, env_data, knowledge)
    
    return [
        {
            "role": "system",
            "content": LLM_SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": user_prompt
        }
    ]
