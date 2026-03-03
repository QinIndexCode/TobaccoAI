import aiohttp
import json
import re
from typing import Dict, Any, List, Optional
from pathlib import Path

from app.config import settings
from app.utils.image_utils import prepare_image_for_ollama
from app.services.prompts import build_vl_messages, build_llm_messages


class OllamaService:
    def __init__(self):
        self._config = None
        self.base_url = None
        self.vl_model = None
        self.llm_model = None
        self.timeout = aiohttp.ClientTimeout(total=120)
        self._load_config()
    
    def _load_config(self):
        """加载配置"""
        config = self._get_config()
        self.base_url = config.get('ollamaBaseUrl', 'http://localhost:11434')
        self.vl_model = config.get('vlModel', 'qwen2.5-vl')
        self.llm_model = config.get('llmModel', 'qwen2.5')
    
    def _get_config(self) -> dict:
        """获取配置"""
        if self._config:
            return self._config
        
        config_file = Path(__file__).parent.parent / "config.json"
        if config_file.exists():
            try:
                import json
                with open(config_file, 'r', encoding='utf-8') as f:
                    self._config = json.load(f)
                    return self._config
            except Exception as e:
                print(f"加载配置失败：{e}")
        
        return {
            'ollamaBaseUrl': getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434'),
            'vlModel': getattr(settings, 'VL_MODEL', 'qwen2.5-vl'),
            'llmModel': getattr(settings, 'LLM_MODEL', 'qwen2.5'),
        }
    
    def reload_config(self):
        """重新加载配置"""
        self._config = None
        self._load_config()
    
    async def check_ollama_status(self) -> bool:
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
                async with session.get(f"{self.base_url}/api/tags") as response:
                    return response.status == 200
        except Exception:
            return False
    
    async def get_available_models(self) -> List[str]:
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(f"{self.base_url}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        return [model.get('name', '') for model in data.get('models', [])]
        except Exception:
            pass
        return []
    
    async def _call_chat_api(self, model: str, messages: list, stream: bool = False) -> Dict[str, Any]:
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream
        }
        
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.post(
                f"{self.base_url}/api/chat",
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Ollama API error: {response.status} - {error_text}")
                
                if stream:
                    result_text = ""
                    async for line in response.content:
                        if line:
                            try:
                                data = json.loads(line)
                                if 'message' in data:
                                    result_text += data['message'].get('content', '')
                            except json.JSONDecodeError:
                                continue
                    return {"response": result_text}
                else:
                    return await response.json()
    
    async def analyze_image(self, image_path: str) -> Dict[str, Any]:
        image_data = prepare_image_for_ollama(image_path)
        messages = build_vl_messages([image_data])
        
        result = await self._call_chat_api(self.vl_model, messages)
        
        response_content = result.get('message', {}).get('content', '')
        
        try:
            json_match = re.search(r'\{[\s\S]*\}', response_content)
            if json_match:
                vl_result = json.loads(json_match.group())
            else:
                vl_result = {
                    "growth_stage": "未知",
                    "leaf_health": 0,
                    "issues": [],
                    "other_observations": response_content,
                    "parse_error": "无法解析为JSON格式"
                }
        except json.JSONDecodeError:
            vl_result = {
                "growth_stage": "未知",
                "leaf_health": 0,
                "issues": [],
                "other_observations": response_content,
                "parse_error": "JSON解析失败"
            }
        
        return vl_result
    
    async def analyze_multiple_images(self, image_paths: List[str]) -> Dict[str, Any]:
        image_data_list = [prepare_image_for_ollama(path) for path in image_paths]
        messages = build_vl_messages(image_data_list)
        
        result = await self._call_chat_api(self.vl_model, messages)
        
        response_content = result.get('message', {}).get('content', '')
        
        try:
            json_match = re.search(r'\{[\s\S]*\}', response_content)
            if json_match:
                vl_result = json.loads(json_match.group())
            else:
                vl_result = {
                    "growth_stage": "未知",
                    "leaf_health": 0,
                    "issues": [],
                    "other_observations": response_content,
                    "parse_error": "无法解析为JSON格式"
                }
        except json.JSONDecodeError:
            vl_result = {
                "growth_stage": "未知",
                "leaf_health": 0,
                "issues": [],
                "other_observations": response_content,
                "parse_error": "JSON解析失败"
            }
        
        return vl_result
    
    async def generate_suggestion(
        self, 
        vl_result: Dict[str, Any], 
        env_data: Optional[Dict[str, Any]] = None, 
        knowledge: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        messages = build_llm_messages(vl_result, env_data or {}, knowledge or {})
        
        result = await self._call_chat_api(self.llm_model, messages)
        
        response_content = result.get('message', {}).get('content', '')
        
        return {
            "suggestion": response_content,
            "model": self.llm_model
        }
    
    async def full_diagnosis(
        self, 
        image_paths: List[str], 
        env_data: Optional[Dict[str, Any]] = None, 
        knowledge: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if len(image_paths) == 1:
            vl_result = await self.analyze_image(image_paths[0])
        else:
            vl_result = await self.analyze_multiple_images(image_paths)
        
        suggestion_result = await self.generate_suggestion(vl_result, env_data, knowledge)
        
        return {
            "image_analysis": vl_result,
            "suggestion": suggestion_result["suggestion"],
            "model_info": {
                "vl_model": self.vl_model,
                "llm_model": self.llm_model
            }
        }


ollama_service = OllamaService()
