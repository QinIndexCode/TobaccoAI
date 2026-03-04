"""
AI 问诊服务 - 基于知识库和 LLM 的智能诊断和建议
支持上下文理解、多轮对话、持久化存储
"""
import json
import os
import re
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.knowledge import get_diseases, get_nutrient_deficiencies, get_growth_stages
from app.utils.search_engine import smart_search, expand_keywords
from app.services.ollama_service import ollama_service

class AIConsultationService:
    """AI 问诊服务类"""
    
    def __init__(self, storage_path: str = "data/consultations"):
        """
        初始化 AI 问诊服务
        
        Args:
            storage_path: 问诊记录存储路径
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        # 加载知识库
        self.diseases = get_diseases()
        self.nutrients = get_nutrient_deficiencies()
        self.stages = get_growth_stages()
        
        # 上下文缓存（内存）
        self.contexts: Dict[str, List[Dict]] = {}
    
    def analyze_query(self, query: str, user_id: str = "default") -> Dict[str, Any]:
        """
        分析用户查询，提供智能诊断（同步版本，使用规则引擎）
        
        Args:
            query: 用户问题
            user_id: 用户 ID
            
        Returns:
            诊断结果
        """
        import asyncio
        
        # 尝试使用异步方法（如果有事件循环）
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # 在已有事件循环中，创建任务
                task = loop.create_task(self.async_analyze_query(query, user_id))
                # 使用 run_until_complete 会导致错误，返回一个占位符
                return {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "query": query,
                    "intent": "pending",
                    "diagnosis": {
                        "summary": "正在处理...",
                        "llm_used": True,
                        "note": "异步调用中"
                    },
                    "timestamp": datetime.now().isoformat()
                }
        except RuntimeError:
            pass
        
        # 没有事件循环时，创建新的
        return asyncio.run(self.async_analyze_query(query, user_id))
    
    async def async_analyze_query(self, query: str, user_id: str = "default") -> Dict[str, Any]:
        """
        异步分析用户查询，提供智能诊断（使用 LLM）
        
        Args:
            query: 用户问题
            user_id: 用户 ID
            
        Returns:
            诊断结果
        """
        # 1. 关键词扩展和意图识别
        keywords = expand_keywords(query)
        
        # 2. 搜索相关知识
        disease_results = smart_search(
            query=query,
            data_list=self.diseases,
            search_fields=['name', 'type', 'symptoms', 'prevention', 'treatment'],
            min_score=0.5
        )
        
        nutrient_results = smart_search(
            query=query,
            data_list=self.nutrients,
            search_fields=['name', 'type', 'symptoms', 'prevention', 'treatment'],
            min_score=0.5
        )
        
        # 3. 识别用户意图
        intent = self._identify_intent(query, keywords)
        
        # 4. 获取上下文
        context = self.get_context(user_id)
        
        # 5. 使用 LLM 生成诊断建议
        diagnosis = await self.async_generate_diagnosis(
            query=query,
            diseases=disease_results[:5],
            nutrients=nutrient_results[:5],
            intent=intent,
            context=context
        )
        
        # 6. 保存问诊记录
        consultation_record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "query": query,
            "keywords": list(keywords)[:10],
            "intent": intent,
            "diagnosis": diagnosis,
            "timestamp": datetime.now().isoformat(),
        }
        
        self._save_consultation(consultation_record)
        self._update_context(user_id, consultation_record)
        
        return consultation_record
    
    def _identify_intent(self, query: str, keywords: set) -> str:
        """
        识别用户意图
        
        Args:
            query: 用户问题
            keywords: 扩展关键词
            
        Returns:
            意图类型
        """
        query_lower = query.lower()
        
        # 症状描述类
        symptom_keywords = {'黄', '黑', '斑', '卷', '蔫', '烂', '枯', '霉'}
        if any(kw in query_lower for kw in symptom_keywords):
            return "symptom_description"
        
        # 防治方法类
        if any(kw in query_lower for kw in ['怎么办', '怎么治', '如何防治', '用什么药']):
            return "treatment_request"
        
        # 原因询问类
        if any(kw in query_lower for kw in ['为什么', '什么原因', '怎么回事']):
            return "cause_inquiry"
        
        # 生长阶段类
        if any(kw in query_lower for kw in ['什么时候', '多久', '阶段']):
            return "growth_stage"
        
        # 默认：综合诊断
        return "comprehensive_diagnosis"
    
    async def _generate_diagnosis_with_llm(
        self,
        query: str,
        diseases: List[Dict],
        nutrients: List[Dict],
        intent: str,
        context: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        使用 LLM 生成智能诊断建议
        
        Args:
            query: 用户问题
            diseases: 匹配的病害列表
            nutrients: 匹配的营养缺乏列表
            intent: 用户意图
            context: 对话上下文
            
        Returns:
            诊断建议
        """
        # 构建 LLM 提示词
        knowledge_context = []
        
        if diseases:
            disease_info = "\n".join([
                f"- {d['name']} ({d['type']}): 症状={d['symptoms'][:100]}, 防治={d['prevention'][:100]}, 治疗={d['treatment'][:100]}"
                for d in diseases[:5]
            ])
            knowledge_context.append(f"【可能的病害】\n{disease_info}")
        
        if nutrients:
            nutrient_info = "\n".join([
                f"- {n['name']}: 症状={n['symptoms'][:100]}, 防治={n['prevention'][:100]}, 治疗={n['treatment'][:100]}"
                for n in nutrients[:5]
            ])
            knowledge_context.append(f"【可能的营养缺乏】\n{nutrient_info}")
        
        # 构建系统提示
        system_prompt = """你是一位专业的烟草种植专家，具有丰富的烟草病害诊断和防治经验。
请根据用户的问题和相关知识库信息，提供专业、准确、易懂的诊断建议。

**输出格式要求**（请严格按照以下格式回答）：

## 诊断总结
（用 1-2 句话总结问题和诊断结果）

## 可能的病因
1. **病因名称**：详细描述症状和原因（50-100 字）
2. **病因名称**：详细描述症状和原因

## 防治建议
1. 具体措施一（详细说明如何操作）
2. 具体措施二（详细说明如何操作）
3. 具体措施三（详细说明如何操作）

## 治疗方案
1. 用药方案或治疗方法一
2. 用药方案或治疗方法二

## 预防措施
1. 日常预防管理措施一
2. 日常预防管理措施二

注意：
- 用亲切、专业的中文回答
- 如果有多种可能，按可能性从高到低排列
- 避免使用过于专业的术语，必要时解释
- 每个条目都要有实际内容，不要空洞"""

        # 构建用户提示
        user_prompt = f"""用户问题：{query}

相关知识点：
{chr(10).join(knowledge_context)}

请根据以上信息，严格按照输出格式要求，为用户提供详细的诊断建议。"""

        try:
            # 调用 LLM
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            result = await ollama_service._call_chat_api(
                ollama_service.llm_model,
                messages
            )
            
            llm_response = result.get('message', {}).get('content', '')
            
            # 解析 LLM 回复，结构化输出
            diagnosis = self._parse_llm_response(llm_response, diseases, nutrients)
            diagnosis['llm_used'] = True
            diagnosis['model'] = ollama_service.llm_model
            
            return diagnosis
            
        except Exception as e:
            print(f"LLM 调用失败，使用规则引擎：{e}")
            # LLM 失败时降级到规则引擎
            return self._generate_diagnosis_with_rules(query, diseases, nutrients, intent)
    
    def _generate_diagnosis_with_rules(
        self,
        query: str,
        diseases: List[Dict],
        nutrients: List[Dict],
        intent: str
    ) -> Dict[str, Any]:
        """
        使用规则引擎生成诊断建议（降级方案）
        """
        diagnosis = {
            "summary": "",
            "possible_causes": [],
            "suggestions": [],
            "prevention": [],
            "treatment": [],
            "llm_used": False
        }
        
        if intent == "symptom_description":
            causes = []
            for d in diseases:
                causes.append({
                    "type": "病害",
                    "name": d['name'],
                    "probability": "高" if d.get('_search_score', 0) > 5 else "中",
                    "symptoms": d['symptoms'][:50] + "..." if len(d['symptoms']) > 50 else d['symptoms'],
                })
            for n in nutrients:
                causes.append({
                    "type": "营养缺乏",
                    "name": n['name'],
                    "probability": "高" if n.get('_search_score', 0) > 10 else "中",
                    "symptoms": n['symptoms'][:50] + "..." if len(n['symptoms']) > 50 else n['symptoms'],
                })
            
            diagnosis["summary"] = f"根据您的描述，可能是以下{len(causes)}种原因导致的："
            diagnosis["possible_causes"] = causes
            
            if diseases:
                diagnosis["treatment"] = [d['treatment'] for d in diseases[:3]]
            if nutrients:
                diagnosis["suggestions"] = [n['treatment'] for n in nutrients[:3]]
                
        elif intent == "treatment_request":
            diagnosis["summary"] = "针对您的问题，建议采取以下防治措施："
            
            if diseases:
                for d in diseases[:3]:
                    diagnosis["treatment"].append(f"{d['name']}: {d['treatment']}")
                    diagnosis["prevention"].append(f"{d['name']}: {d['prevention']}")
            
            if nutrients:
                for n in nutrients[:3]:
                    diagnosis["suggestions"].append(f"{n['name']}: {n['treatment']}")
                    
        elif intent == "cause_inquiry":
            diagnosis["summary"] = "可能导致该问题的原因分析："
            
            for d in diseases[:3]:
                diagnosis["possible_causes"].append({
                    "name": d['name'],
                    "cause": f"{d['type']}病害，主要症状：{d['symptoms'][:80]}...",
                    "conditions": "高温高湿、通风不良、连作等",
                })
            
            for n in nutrients[:3]:
                diagnosis["possible_causes"].append({
                    "name": n['name'],
                    "cause": f"营养元素缺乏，主要症状：{n['symptoms'][:80]}...",
                    "conditions": "施肥不足、土壤贫瘠、吸收不良等",
                })
        else:
            diagnosis["summary"] = "综合诊断结果："
            
            if diseases:
                diagnosis["possible_causes"] = [
                    {"name": d['name'], "type": d['type'], "severity": d.get('severity', '中')}
                    for d in diseases[:5]
                ]
            
            if nutrients:
                diagnosis["possible_causes"].extend([
                    {"name": n['name'], "type": "营养缺乏"}
                    for n in nutrients[:3]
                ])
            
            diagnosis["suggestions"] = [
                "1. 加强田间管理，及时清除病株",
                "2. 合理施肥，平衡氮磷钾比例",
                "3. 改善通风透光条件",
                "4. 根据具体症状选择合适的药剂防治"
            ]
        
        return diagnosis
    
    def _generate_diagnosis(
        self,
        query: str,
        diseases: List[Dict],
        nutrients: List[Dict],
        intent: str
    ) -> Dict[str, Any]:
        """
        生成诊断建议（同步方法，使用规则引擎）
        注意：如需使用 LLM，请调用 async_generate_diagnosis
        """
        return self._generate_diagnosis_with_rules(query, diseases, nutrients, intent)
    
    async def async_generate_diagnosis(
        self,
        query: str,
        diseases: List[Dict],
        nutrients: List[Dict],
        intent: str,
        context: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        异步生成诊断建议（使用 LLM）
        """
        return await self._generate_diagnosis_with_llm(query, diseases, nutrients, intent, context)
    
    def _parse_llm_response(self, llm_response: str, diseases: List[Dict], nutrients: List[Dict]) -> Dict[str, Any]:
        """
        解析 LLM 回复，提取结构化信息
        
        Args:
            llm_response: LLM 的回复文本
            diseases: 匹配的病害列表
            nutrients: 匹配的营养缺乏列表
            
        Returns:
            结构化的诊断结果
        """
        diagnosis = {
            "summary": "",
            "possible_causes": [],
            "suggestions": [],
            "prevention": [],
            "treatment": [],
        }
        
        # 定义章节映射
        section_patterns = {
            'summary': r'##\s*诊断总结\s*\n(.*?)(?=##|\Z)',
            'causes': r'##\s*可能的病因\s*\n(.*?)(?=##|\Z)',
            'suggestions': r'##\s*防治建议\s*\n(.*?)(?=##|\Z)',
            'treatment': r'##\s*治疗方案\s*\n(.*?)(?=##|\Z)',
            'prevention': r'##\s*预防措施\s*\n(.*?)(?=##|\Z)',
        }
        
        # 提取各个章节
        for section_name, pattern in section_patterns.items():
            match = re.search(pattern, llm_response, re.DOTALL | re.IGNORECASE)
            if match:
                content = match.group(1).strip()
                
                if section_name == 'summary':
                    diagnosis["summary"] = content
                else:
                    # 提取列表项
                    items = self._extract_list_items(content)
                    diagnosis[section_name] = items
        
        # 如果没有找到总结，尝试从开头提取
        if not diagnosis["summary"]:
            first_section = re.split(r'\n##\s*', llm_response)[0].strip()
            if first_section:
                diagnosis["summary"] = first_section
        
        # 如果 possible_causes 为空但有 diseases/nutrients 数据，使用规则引擎补充
        if not diagnosis["possible_causes"]:
            for d in diseases[:3]:
                diagnosis["possible_causes"].append({
                    "name": d['name'],
                    "type": d['type'],
                    "description": d['symptoms'][:100] + "..." if len(d['symptoms']) > 100 else d['symptoms']
                })
            for n in nutrients[:3]:
                diagnosis["possible_causes"].append({
                    "name": n['name'],
                    "type": "营养缺乏",
                    "description": n['symptoms'][:100] + "..." if len(n['symptoms']) > 100 else n['symptoms']
                })
        
        return diagnosis
    
    def _extract_list_items(self, content: str) -> List[Dict[str, str]]:
        """
        从内容中提取列表项
        
        Args:
            content: 列表内容
            
        Returns:
            列表项字典
        """
        items = []
        lines = content.split('\n')
        
        current_item = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 检测新的列表项（数字开头或项目符号）
            if re.match(r'^\d+[\.\)]\s*', line) or re.match(r'^[•·-]\s*', line):
                # 保存前一个项目
                if current_item:
                    items.append({"description": current_item.strip()})
                # 开始新项目
                current_item = line
            else:
                # 继续当前项目
                current_item += " " + line
        
        # 添加最后一个项目
        if current_item:
            items.append({"description": current_item.strip()})
        
        return items
    
    def _save_consultation(self, record: Dict[str, Any]) -> None:
        """
        保存问诊记录到文件
        
        Args:
            record: 问诊记录
        """
        user_id = record.get('user_id', 'default')
        user_file = self.storage_path / f"{user_id}.json"
        
        # 读取现有记录
        records = []
        if user_file.exists():
            try:
                with open(user_file, 'r', encoding='utf-8') as f:
                    records = json.load(f)
            except:
                records = []
        
        # 添加新记录（保留最近 50 条）
        records.insert(0, record)
        records = records[:50]
        
        # 保存
        with open(user_file, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
    
    def _update_context(self, user_id: str, record: Dict[str, Any]) -> None:
        """
        更新用户上下文（内存）
        
        Args:
            user_id: 用户 ID
            record: 问诊记录
        """
        if user_id not in self.contexts:
            self.contexts[user_id] = []
        
        self.contexts[user_id].append({
            "query": record['query'],
            "intent": record['intent'],
            "timestamp": record['timestamp'],
        })
        
        # 保留最近 10 条
        self.contexts[user_id] = self.contexts[user_id][-10:]
    
    def get_consultation_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """
        获取用户问诊历史
        
        Args:
            user_id: 用户 ID
            limit: 返回数量限制
            
        Returns:
            问诊历史列表
        """
        user_file = self.storage_path / f"{user_id}.json"
        
        if not user_file.exists():
            return []
        
        try:
            with open(user_file, 'r', encoding='utf-8') as f:
                records = json.load(f)
            return records[:limit]
        except:
            return []
    
    def get_context(self, user_id: str) -> List[Dict]:
        """
        获取用户上下文
        
        Args:
            user_id: 用户 ID
            
        Returns:
            上下文列表
        """
        return self.contexts.get(user_id, [])
    
    def clear_context(self, user_id: str) -> None:
        """
        清除用户上下文
        
        Args:
            user_id: 用户 ID
        """
        if user_id in self.contexts:
            self.contexts[user_id] = []
    
    def delete_consultation(self, user_id: str, record_id: str) -> bool:
        """
        删除单条问诊记录
        
        Args:
            user_id: 用户 ID
            record_id: 记录 ID
            
        Returns:
            是否删除成功
        """
        user_file = self.storage_path / f"{user_id}.json"
        
        if not user_file.exists():
            return False
        
        try:
            with open(user_file, 'r', encoding='utf-8') as f:
                records = json.load(f)
            
            # 查找并删除记录
            original_count = len(records)
            records = [r for r in records if r.get('id') != record_id]
            
            if len(records) < original_count:
                # 保存更新后的记录
                with open(user_file, 'w', encoding='utf-8') as f:
                    json.dump(records, f, ensure_ascii=False, indent=2)
                return True
            
            return False
        except:
            return False


# 全局服务实例
ai_consultation_service = AIConsultationService()
