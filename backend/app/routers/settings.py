"""
设置路由器 - 处理应用配置相关 API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional
import json
import os
from app.utils.security import security_manager

router = APIRouter(prefix="/api/settings", tags=["settings"])

# 配置文件路径
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "config.json")


class SettingsConfig(BaseModel):
    """配置模型"""
    provider: str = "ollama-local"
    ollamaBaseUrl: str = "http://localhost:11434"
    vlModel: str = "qwen2.5-vl"
    llmModel: str = "qwen2.5"
    apiKey: Optional[str] = ""
    apiBaseUrl: Optional[str] = ""
    useLocal: bool = True


def load_config() -> dict:
    """加载配置文件"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                # 解密 API Key
                if config.get("apiKey"):
                    config["apiKey"] = security_manager.decrypt(config["apiKey"])
                return config
        except Exception as e:
            print(f"加载配置失败：{e}")
    
    # 返回默认配置
    return {
        "provider": "ollama-local",
        "ollamaBaseUrl": "http://localhost:11434",
        "vlModel": "qwen2.5-vl",
        "llmModel": "qwen2.5",
        "apiKey": "",
        "apiBaseUrl": "",
        "useLocal": True
    }


def save_config(config: dict) -> bool:
    """保存配置文件（加密敏感数据）"""
    try:
        # 加密 API Key
        config_to_save = config.copy()
        if config_to_save.get("apiKey"):
            config_to_save["apiKey"] = security_manager.encrypt(config_to_save["apiKey"])
        
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config_to_save, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"保存配置失败：{e}")
        return False


@router.get("")
async def get_settings():
    """获取当前配置"""
    config = load_config()
    # 返回掩码后的 API Key（不暴露完整密钥）
    if "apiKey" in config:
        config["apiKey"] = security_manager.mask(config["apiKey"]) if config["apiKey"] else ""
    return config


@router.post("")
async def save_settings(config: SettingsConfig):
    """保存配置"""
    config_dict = config.model_dump()
    
    # 如果 API Key 是掩码，保留原来的值
    if config_dict.get("apiKey") == "***":
        current_config = load_config()
        config_dict["apiKey"] = current_config.get("apiKey", "")
    
    if save_config(config_dict):
        # 重新加载 Ollama 服务配置
        try:
            from app.services.ollama_service import ollama_service
            ollama_service.reload_config()
        except Exception as e:
            print(f"重新加载服务配置失败：{e}")
        
        return {"success": True, "message": "配置保存成功"}
    else:
        raise HTTPException(status_code=500, detail="保存配置失败")


@router.post("/test")
async def test_settings(config: SettingsConfig):
    """测试连接"""
    import aiohttp
    
    try:
        # 测试 Ollama 连接
        if config.provider in ["ollama-local", "ollama-remote"]:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{config.ollamaBaseUrl}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        models = data.get("models", [])
                        model_names = [m["name"] for m in models]
                        
                        message = f"连接成功！找到 {len(models)} 个模型"
                        if config.vlModel in model_names:
                            message += f"，视觉模型 '{config.vlModel}' 可用"
                        if config.llmModel in model_names:
                            message += f"，语言模型 '{config.llmModel}' 可用"
                        
                        return {"success": True, "message": message}
                    else:
                        return {
                            "success": False,
                            "message": f"连接失败，状态码：{response.status}"
                        }
        
        # 测试 OpenAI 兼容 API
        elif config.provider == "openai-compatible":
            if not config.apiBaseUrl or not config.apiKey:
                return {
                    "success": False,
                    "message": "请提供 API 基础地址和 API Key"
                }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{config.apiBaseUrl}/models",
                    headers={"Authorization": f"Bearer {config.apiKey}"},
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        return {"success": True, "message": "API 连接成功！"}
                    else:
                        return {
                            "success": False,
                            "message": f"API 验证失败，状态码：{response.status}"
                        }
        
        return {"success": False, "message": "未知的服务商类型"}
    
    except aiohttp.ClientError as e:
        return {
            "success": False,
            "message": f"连接错误：{str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"测试失败：{str(e)}"
        }
