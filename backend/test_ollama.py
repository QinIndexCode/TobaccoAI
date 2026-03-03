import asyncio
import sys
sys.path.insert(0, '.')

from app.services.ollama_service import ollama_service


async def test_ollama_connection():
    print("=" * 50)
    print("Ollama 服务连接测试")
    print("=" * 50)
    
    print(f"\n配置信息:")
    print(f"  - Ollama URL: {ollama_service.base_url}")
    print(f"  - VL Model: {ollama_service.vl_model}")
    print(f"  - LLM Model: {ollama_service.llm_model}")
    
    print("\n正在检查 Ollama 服务状态...")
    is_available = await ollama_service.check_ollama_status()
    
    if is_available:
        print("✅ Ollama 服务可用!")
        
        print("\n正在获取可用模型列表...")
        models = await ollama_service.get_available_models()
        if models:
            print(f"可用模型 ({len(models)} 个):")
            for model in models:
                print(f"  - {model}")
        else:
            print("未找到可用模型")
        
        vl_model_available = any(ollama_service.vl_model in m for m in models)
        llm_model_available = any(ollama_service.llm_model in m for m in models)
        
        print(f"\n模型检查:")
        print(f"  - VL模型 ({ollama_service.vl_model}): {'✅ 已安装' if vl_model_available else '❌ 未安装'}")
        print(f"  - LLM模型 ({ollama_service.llm_model}): {'✅ 已安装' if llm_model_available else '❌ 未安装'}")
        
        if not vl_model_available or not llm_model_available:
            print("\n提示: 请使用以下命令安装所需模型:")
            if not vl_model_available:
                print(f"  ollama pull {ollama_service.vl_model}")
            if not llm_model_available:
                print(f"  ollama pull {ollama_service.llm_model}")
    else:
        print("❌ Ollama 服务不可用!")
        print("\n请确保:")
        print("  1. Ollama 已正确安装")
        print("  2. Ollama 服务正在运行 (运行 'ollama serve')")
        print(f"  3. 服务地址正确: {ollama_service.base_url}")
    
    print("\n" + "=" * 50)
    return is_available


async def test_image_analysis(image_path: str = None):
    if not image_path:
        print("\n跳过图片分析测试 (未提供测试图片)")
        return
    
    print("\n" + "=" * 50)
    print("图片分析测试")
    print("=" * 50)
    
    try:
        print(f"\n正在分析图片: {image_path}")
        result = await ollama_service.analyze_image(image_path)
        print("\n分析结果:")
        import json
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"❌ 分析失败: {e}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="测试 Ollama 服务")
    parser.add_argument("--image", type=str, help="测试图片路径")
    args = parser.parse_args()
    
    is_connected = asyncio.run(test_ollama_connection())
    
    if is_connected and args.image:
        asyncio.run(test_image_analysis(args.image))
