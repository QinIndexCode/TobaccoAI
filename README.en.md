<div align="center">

<img src="TobaccoAI.png" width="200" alt="TobaccoAI"/>

# TobaccoAI - Intelligent Tobacco Disease Diagnosis System

🌿 AI-powered tobacco disease diagnosis tool with local models

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10-3776ab?logo=python)](https://www.python.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-FF6B6B?logo=ollama)](https://ollama.ai/)

</div>

## 🎯 Key Features

### 1. Intelligent Diagnosis
- 📷 Upload tobacco leaf images (up to 3 photos)
- 🌡️ Input environmental data (temperature, humidity, growth stage)
- 🤖 AI analysis with diagnostic report
- 💡 Health score and treatment recommendations

### 2. Knowledge Base
- 📖 22 tobacco diseases encyclopedia (viral/fungal/bacterial/physiological)
- 🌱 Growth stage reference
- 🥀 Nutrient deficiency identification
- 🔍 Keyword search

### 3. History Records
- 📋 View past diagnosis records
- 📊 Compare diagnoses across different periods
- 🗑️ Delete records

### 4. AI Consultation
- 💬 Chat-based AI consultation
- 🔄 Multi-turn conversation support

## 🛠️ Technology Stack

**Frontend**
- React 19 + Vite 7
- Ant Design 6 + TailwindCSS 4
- React Router 7

**Backend**
- FastAPI + Uvicorn
- SQLite + SQLAlchemy (Async)
- Pydantic Data Validation

**AI Models**
- Ollama Local Deployment
- Qwen3.5-VL (Image Recognition)
- Qwen2.5-Coder (Suggestion Generation)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Python >= 3.10
- Ollama >= 0.1.0

### 1. Install Ollama Models

```bash
ollama pull qwen3.5-vl
ollama pull qwen2.5-coder
```

### 2. Start Services

**Option 1: One-Click Start (Recommended)**
```bash
# Windows
start.bat

# PowerShell
.\start.ps1
```

**Option 2: Manual Start**
```bash
# Backend (Terminal 1)
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
yanzhitong/
├── backend/
│   ├── app/
│   │   ├── routers/         # API Routes
│   │   ├── services/        # AI Services
│   │   ├── models/          # Database Models
│   │   ├── knowledge/       # Knowledge Base Data
│   │   └── utils/           # Utility Functions
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page Components
│   │   ├── components/      # Reusable Components
│   │   └── services/        # API Services
│   └── package.json
├── start.bat / start.ps1    # Startup Scripts
└── README.md
```

## 📚 API Endpoints

### Diagnosis Endpoints
```bash
POST /api/diagnose/           # Create diagnosis
GET  /api/diagnosis/history   # Get history
GET  /api/diagnosis/{id}      # Diagnosis details
DELETE /api/diagnosis/{id}    # Delete diagnosis
```

### Knowledge Base Endpoints
```bash
GET /api/knowledge/diseases        # Disease list
GET /api/knowledge/growth-stages   # Growth stages
GET /api/knowledge/deficiency      # Nutrient deficiency
GET /api/knowledge/search?q=xxx    # Search
```

### Other Endpoints
```bash
GET  /api/weather?location=xxx     # Weather data
POST /api/ai/chat                  # AI consultation
GET  /api/settings                 # System settings
```

## ⚙️ Configuration

### Backend Configuration (.env)
```env
OLLAMA_BASE_URL=http://localhost:11434
VL_MODEL=qwen3.5-vl
LLM_MODEL=qwen2.5-coder
DATABASE_URL=sqlite+aiosqlite:///./tobacco.db
PORT=8000
```

### Frontend Configuration
```javascript
// vite.config.js
server: {
  port: 5173,
  proxy: { '/api': 'http://localhost:8000' }
}
```

## 🔐 Security Features

- ✅ API Key encrypted with Fernet (AES-128-CBC)
- ✅ Key separation from configuration
- ✅ SQLAlchemy ORM prevents SQL injection
- ✅ React automatic XSS protection
- ✅ CORS restrictions

## ♿ Accessibility

- Skip navigation links
- ARIA labels and roles
- Keyboard navigation support
- Visible focus indicators
- Screen reader friendly

## 🐛 Troubleshooting

**Ollama Connection Failed**
```bash
ollama list      # Check models
ollama serve     # Restart service
```

**Port Already in Use**
```javascript
// Modify port in vite.config.js or .env
```

**Dependency Installation Failed**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 📊 Core Workflow

```
Upload Images → Environmental Data → AI Analysis → Diagnosis Result → Save to Database
                      ↓
              VL Model Image Recognition
                      ↓
              LLM Model Suggestion Generation
                      ↓
              Structured JSON Response
```

## 📝 Development Guidelines

**Code Style**
- Frontend: ESLint
- Backend: Black + Flake8

**Git Commits**
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue #123"
```

## 📜 License

MIT License

---

**TobaccoAI** - Making tobacco cultivation smarter 🌿
