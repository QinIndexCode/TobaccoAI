<div align="center">

<img src="TobaccoAI.png" width="200" alt="TobaccoAI"/>

# 烟智通（TobaccoAI） - 烟草病害智能诊断系统

🌿 基于本地 AI 模型的烟草病害智能诊断工具

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10-3776ab?logo=python)](https://www.python.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-FF6B6B?logo=ollama)](https://ollama.ai/)

</div>

## 🎯 核心功能

### 1. 智能诊断
- 📷 上传烟草叶片图片（最多 3 张）
- 🌡️ 填写环境数据（温度、湿度、生长阶段）
- 🤖 AI 分析并生成诊断报告
- 💡 提供健康评分和防治建议

### 2. 知识库
- 📖 22 种烟草病害百科（病毒/真菌/细菌/生理性）
- 🌱 生长阶段查询
- 🥀 营养缺乏症状识别
- 🔍 关键词搜索

### 3. 历史记录
- 📋 查看历史诊断记录
- 📊 对比不同时期诊断结果
- 🗑️ 删除诊断记录

### 4. AI 咨询
- 💬 与 AI 进行对话式咨询
- 🔄 支持多轮对话

## 🛠️ 技术架构

**前端**
- React 19 + Vite 7
- Ant Design 6 + TailwindCSS 4
- React Router 7

**后端**
- FastAPI + Uvicorn
- SQLite + SQLAlchemy (异步)
- Pydantic 数据验证

**AI 模型**
- Ollama 本地部署
- Qwen3.5-VL（图像识别）
- Qwen2.5-Coder（建议生成）

## 🚀 快速开始

### 前置要求
- Node.js >= 18.0.0
- Python >= 3.10
- Ollama >= 0.1.0

### 1. 安装 Ollama 模型

```bash
ollama pull qwen3.5-vl
ollama pull qwen2.5-coder
```

### 2. 启动服务

**方式一：一键启动（推荐）**
```bash
# Windows
start.bat

# PowerShell
.\start.ps1
```

**方式二：手动启动**
```bash
# 后端（终端 1）
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# 前端（终端 2）
cd frontend
npm run dev
```

### 3. 访问应用
- 前端：http://localhost:5173
- API 文档：http://localhost:8000/docs

## 📁 项目结构

```
yanzhitong/
├── backend/
│   ├── app/
│   │   ├── routers/         # API 路由
│   │   ├── services/        # AI 服务层
│   │   ├── models/          # 数据库模型
│   │   ├── knowledge/       # 知识库数据
│   │   └── utils/           # 工具函数
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 可复用组件
│   │   └── services/        # API 服务
│   └── package.json
├── start.bat / start.ps1    # 启动脚本
└── README.md
```

## 📚 API 接口

### 诊断接口
```bash
POST /api/diagnose/           # 创建诊断
GET  /api/diagnosis/history   # 获取历史
GET  /api/diagnosis/{id}      # 诊断详情
DELETE /api/diagnosis/{id}    # 删除诊断
```

### 知识库接口
```bash
GET /api/knowledge/diseases        # 病害列表
GET /api/knowledge/growth-stages   # 生长阶段
GET /api/knowledge/deficiency      # 营养缺乏
GET /api/knowledge/search?q=xxx    # 搜索
```

### 其他接口
```bash
GET  /api/weather?location=xxx     # 天气数据
POST /api/ai/chat                  # AI 咨询
GET  /api/settings                 # 系统设置
```

## ⚙️ 配置说明

### 后端配置 (.env)
```env
OLLAMA_BASE_URL=http://localhost:11434
VL_MODEL=qwen3.5-vl
LLM_MODEL=qwen2.5-coder
DATABASE_URL=sqlite+aiosqlite:///./tobacco.db
PORT=8000
```

### 前端配置
```javascript
// vite.config.js
server: {
  port: 5173,
  proxy: { '/api': 'http://localhost:8000' }
}
```

## 🔐 安全特性

- ✅ API Key Fernet 加密存储（AES-128-CBC）
- ✅ 密钥分离存储
- ✅ SQLAlchemy ORM 防 SQL 注入
- ✅ React 自动 XSS 防护
- ✅ CORS 跨域限制

## ♿ 无障碍设计

- 跳过导航链接
- ARIA 标签
- 键盘导航
- 焦点可见样式
- 屏幕阅读器友好

## 🐛 常见问题

**Ollama 连接失败**
```bash
ollama list      # 检查模型
ollama serve     # 重启服务
```

**端口被占用**
```javascript
// 修改 vite.config.js 或 .env 中的端口
```

**依赖安装失败**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 📊 核心流程

```
上传图片 → 环境数据 → AI 分析 → 诊断结果 → 保存到数据库
                ↓
        VL 模型识别图像
                ↓
        LLM 模型生成建议
                ↓
        结构化 JSON 返回
```

## 📝 开发规范

**代码风格**
- 前端：ESLint
- 后端：Black + Flake8

**Git 提交**
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue #123"
```

## 📜 许可证

MIT License

---

**烟智通** - 让烟草种植更智能 🌿
