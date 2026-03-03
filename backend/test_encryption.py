"""
测试加密功能
"""
import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.utils.security import security_manager

def test_encryption():
    """测试加密和解密功能"""
    print("=" * 50)
    print("测试 API Key 加密功能")
    print("=" * 50)
    
    # 测试数据
    test_api_keys = [
        "sk-1234567890abcdef",
        "Bearer token_abc123",
        "api_key_test_value",
        "",  # 空字符串
    ]
    
    for api_key in test_api_keys:
        print(f"\n原始数据：'{api_key}'")
        
        # 加密
        encrypted = security_manager.encrypt(api_key)
        print(f"加密后：  {encrypted}")
        
        # 解密
        decrypted = security_manager.decrypt(encrypted)
        print(f"解密后：  {decrypted}")
        
        # 验证
        if api_key == decrypted:
            print("✓ 加密解密成功")
        else:
            print("✗ 加密解密失败")
        
        # 掩码显示
        masked = security_manager.mask(api_key)
        print(f"掩码显示：{masked}")
    
    print("\n" + "=" * 50)
    print("测试完成！")
    print("=" * 50)
    
    # 显示密钥信息
    print(f"\n密钥文件位置：{security_manager.key_file}")
    print(f"密钥文件存在：{security_manager.key_file.exists()}")

if __name__ == "__main__":
    test_encryption()
