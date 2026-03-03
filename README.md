<div align="center">

<img src="TobaccoAI.png" width="200" alt="TobaccoAI"/>

# 烟智通（TobaccoAI）

🌿 基于本地 AI 模型的烟草病害智能诊断工具
</div>

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/) [![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/) [![Python](https://img.shields.io/badge/Python-3.10-3776ab?logo=python)](https://www.python.org/) [![Ollama](https://img.shields.io/badge/Ollama-Local_AI-FF6B6B?logo=ollama)](https://ollama.ai/)

---

## 🌏 选择语言 / Select Language

### [🇨🇳 中文文档](README.zh-CN.md)

完整的功能介绍、技术架构、快速开始指南和 API 文档

### [🇺🇸 English Documentation](README.en.md)

Complete feature introduction, technical architecture, quick start guide and API documentation

---

## 🔗 快速链接 / Quick Links

- [📚 API 文档](http://localhost:8000/docs) - Swagger UI
- [🌿 前端应用](http://localhost:5173) - React 应用
- [🤖 Ollama](https://ollama.ai/) - AI 模型平台

## 🔍 目录 / Table of Contents

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [快速开始](#快速开始)

## 📄 项目简介

烟智通是一个基于本地 AI 模型的烟草病害智能诊断系统，通过图像识别和环境数据分析，为烟草种植者提供准确的病害诊断和防治建议。

TobaccoAI is an AI-powered tobacco disease diagnosis system that uses local models for image recognition and environmental data analysis to provide accurate diagnosis and treatment recommendations for tobacco growers.

## 😶‍🌫️ 核心功能

- 📷 **图像识别** - 支持上传烟草叶片图片，AI 智能识别病害
- 🌡️ **环境分析** - 结合温度、湿度等环境因素提供精准诊断
- 📊 **生长阶段** - 支持不同生长阶段的病害识别
- 🌿 **防治建议** - 提供详细的病害防治方案
- 🔒 **本地部署** - 使用 Ollama 本地部署，数据隐私安全
- ♿ **无障碍** - 符合 WCAG 2.1 AA 标准，人人可用

## 🔧 技术栈

**前端**: React 19 · Vite 7 · Ant Design 6 · TailwindCSS 4  
**后端**: FastAPI · SQLite · SQLAlchemy · Pydantic  
**AI 模型**: Ollama · Qwen3.5-VL · Qwen2.5-Coder

## 🚀 快速开始

### 1. 安装 Ollama 模型
```bash
ollama pull qwen3.5-vl
ollama pull qwen2.5-coder
```

### 2. 启动服务
```bash
# Windows
start.bat

# PowerShell
.\start.ps1
```

### 3. 访问应用
- 前端：http://localhost:5173
- API 文档：http://localhost:8000/docs

---

<div align="center">

**烟智通** - 让烟草种植更智能 🌿

Made with ❤️ for tobacco farmers

