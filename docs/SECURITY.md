# 安全说明 - API Key 加密存储

## 🔐 加密机制

本项目使用 **Fernet 对称加密** 来保护敏感的 API Key，确保即使配置文件被泄露，攻击者也无法轻易获取您的密钥。

### 技术实现

1. **加密算法**: Fernet (基于 AES-128-CBC)
2. **密钥生成**: 使用 `cryptography` 库生成随机密钥
3. **密钥存储**: 密钥文件 `.security_key` 存储在服务器本地
4. **文件权限**: 密钥文件权限设置为 `600`（仅所有者可读写）

### 加密流程

```
用户输入 API Key
    ↓
Fernet 加密 (使用随机生成的密钥)
    ↓
Base64 编码
    ↓
存储到 config.json
```

### 解密流程

```
从 config.json 读取加密数据
    ↓
Base64 解码
    ↓
Fernet 解密 (使用相同的密钥)
    ↓
返回原始 API Key
```

## 📁 关键文件

### 1. 加密密钥文件
**位置**: `backend/app/utils/.security_key`
- **权限**: `600` (仅所有者可读写)
- **内容**: 32 字节的随机密钥（Base64 编码）
- **重要性**: ⚠️ **极其重要**，丢失后将无法解密已存储的 API Key

### 2. 配置文件
**位置**: `backend/app/config.json`
- **内容**: 加密后的配置数据
- **API Key 字段**: 存储的是加密后的密文

### 3. 加密工具
**位置**: `backend/app/utils/security.py`
- **类**: `SecurityManager`
- **方法**:
  - `encrypt()`: 加密字符串
  - `decrypt()`: 解密字符串
  - `mask()`: 掩码显示（用于前端展示）

## 🛡️ 安全特性

### ✅ 已实现的安全措施

1. **加密存储**
   - API Key 在存储前自动加密
   - 读取时自动解密
   - 前端仅显示掩码（如 `sk-abc************`）

2. **密钥保护**
   - 密钥文件权限限制（600）
   - 密钥与配置文件分离存储
   - 密钥文件不纳入版本控制

3. **传输保护**
   - API 接口返回时自动掩码
   - 仅在内部服务调用时使用明文

4. **日志保护**
   - 不记录 API Key
   - 错误信息中自动脱敏

### ⚠️ 注意事项

1. **密钥备份**
   - 定期备份 `.security_key` 文件
   - 更换服务器时需要迁移密钥
   - 丢失密钥 = 丢失所有加密的 API Key

2. **文件权限**
   - 确保密钥文件权限为 600
   - 配置文件权限建议为 644

3. **部署安全**
   - 生产环境使用 HTTPS
   - 限制配置文件的访问权限
   - 定期轮换 API Key

## 🔄 迁移指南

### 从旧版本迁移（未加密）

如果您之前已经存储了 API Key，需要重新保存配置：

1. 访问设置页面：`http://localhost:5173/settings`
2. 重新输入 API Key
3. 点击"保存配置"
4. 系统会自动加密存储

### 服务器迁移

1. 备份以下文件：
   ```
   backend/app/.security_key
   backend/app/config.json
   ```

2. 在新服务器上恢复文件

3. 确保文件权限正确：
   ```bash
   chmod 600 backend/app/.security_key
   chmod 644 backend/app/config.json
   ```

## 📊 安全对比

| 存储方式 | 安全性 | 风险等级 | 推荐度 |
|---------|--------|----------|--------|
| 明文存储 | ❌ 低 | 高 | 不推荐 |
| Base64 编码 | ❌ 低 | 高 | 不推荐 |
| **Fernet 加密** | ✅ **高** | **低** | ✅ **推荐** |
| 环境变量 | ⚠️ 中 | 中 | 可选 |

## 🔍 验证加密

您可以通过以下命令验证 API Key 是否已加密：

```bash
# 查看配置文件
cat backend/app/config.json

# 如果看到类似内容，说明已加密：
# "apiKey": "Z0FBQUFBQm1kWE5sY2lCemVYTjBaVzBnYVc1bWJ3PT0="
```

加密后的字符串特征：
- Base64 格式
- 长度固定
- 无法直接识别原始内容

## 🚨 应急响应

### 如果密钥文件丢失

1. 删除旧的密钥文件（如果存在）
2. 系统会自动生成新密钥
3. 重新保存所有配置（需要重新输入 API Key）

### 如果怀疑密钥泄露

1. 立即删除 `.security_key` 文件
2. 系统会生成新密钥
3. 重新保存所有配置
4. 联系 API 提供商轮换 API Key

## 📚 参考资料

- [Fernet 加密文档](https://cryptography.io/en/latest/fernet/)
- [cryptography 库文档](https://cryptography.io/)
- [OWASP 密钥管理指南](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

**最后更新**: 2026-03-02  
**版本**: 1.0.0
