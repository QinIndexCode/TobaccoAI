"""
加密工具模块
使用 Fernet 对称加密保护敏感数据（如 API Key）
"""
from cryptography.fernet import Fernet
from pathlib import Path
import base64
import os


class SecurityManager:
    """安全管理器 - 处理敏感数据的加密和解密"""
    
    def __init__(self):
        self.key_file = Path(__file__).parent / ".security_key"
        self.key = self._load_or_generate_key()
        self.fernet = Fernet(self.key)
    
    def _load_or_generate_key(self) -> bytes:
        """加载或生成加密密钥"""
        if self.key_file.exists():
            try:
                with open(self.key_file, 'rb') as f:
                    key = f.read().strip()
                    # 验证密钥格式
                    if len(key) == 44 and base64.urlsafe_b64decode(key):
                        return key
            except Exception as e:
                print(f"加载密钥失败：{e}")
        
        # 生成新密钥
        key = Fernet.generate_key()
        try:
            with open(self.key_file, 'wb') as f:
                f.write(key)
            # 设置文件权限（仅所有者可读写）
            os.chmod(self.key_file, 0o600)
            print("已生成新的加密密钥")
        except Exception as e:
            print(f"保存密钥失败：{e}")
        
        return key
    
    def encrypt(self, plaintext: str) -> str:
        """加密字符串"""
        if not plaintext:
            return ""
        try:
            encrypted = self.fernet.encrypt(plaintext.encode('utf-8'))
            return base64.urlsafe_b64encode(encrypted).decode('utf-8')
        except Exception as e:
            print(f"加密失败：{e}")
            return plaintext  # 失败时返回原文
    
    def decrypt(self, ciphertext: str) -> str:
        """解密字符串"""
        if not ciphertext:
            return ""
        try:
            encrypted = base64.urlsafe_b64decode(ciphertext.encode('utf-8'))
            decrypted = self.fernet.decrypt(encrypted)
            return decrypted.decode('utf-8')
        except Exception as e:
            print(f"解密失败：{e}")
            return ciphertext  # 失败时返回密文（可能是旧数据）
    
    def mask(self, text: str, visible_chars: int = 4) -> str:
        """掩码显示敏感信息"""
        if not text:
            return ""
        if len(text) <= visible_chars:
            return "*" * len(text)
        return text[:visible_chars] + "*" * (len(text) - visible_chars)


# 全局安全管理器实例
security_manager = SecurityManager()
