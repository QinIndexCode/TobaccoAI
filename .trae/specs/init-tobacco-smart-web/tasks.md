# Tasks

- [x] Task 1: 项目初始化与基础架构搭建
  - [x] SubTask 1.1: 创建前端项目（React + Vite + TailwindCSS）
  - [x] SubTask 1.2: 创建后端项目（FastAPI + Uvicorn）
  - [x] SubTask 1.3: 配置项目目录结构和基础文件
  - [ ] SubTask 1.4: 创建测试图片目录assets/并放置image1.png、image2.png

- [x] Task 2: 前端基础框架搭建
  - [x] SubTask 2.1: 配置TailwindCSS主题（绿色农业风格，主色#15803d）
  - [x] SubTask 2.2: 创建页面布局组件（Header、Footer、底部导航）
  - [x] SubTask 2.3: 配置React Router路由（首页、诊断页、结果页、历史页、知识页）
  - [x] SubTask 2.4: 创建响应式布局组件（移动端优先）

- [x] Task 3: 后端API基础架构
  - [x] SubTask 3.1: 创建FastAPI应用入口和CORS配置
  - [x] SubTask 3.2: 创建API路由结构（/api/diagnose、/api/history等）
  - [x] SubTask 3.3: 创建数据模型（Pydantic schemas）
  - [x] SubTask 3.4: 配置静态文件服务和图片临时存储

- [x] Task 4: 烟草知识库创建
  - [x] SubTask 4.1: 创建生长阶段环境要求JSON数据
  - [x] SubTask 4.2: 创建常见病害知识库JSON数据（10种病害）
  - [x] SubTask 4.3: 创建营养缺素知识库JSON数据
  - [x] SubTask 4.4: 创建知识库查询工具函数

- [x] Task 5: Ollama VL图像诊断功能实现
  - [x] SubTask 5.1: 创建Ollama API调用模块（http://localhost:11434）
  - [x] SubTask 5.2: 设计VL Prompt模板（系统级固定格式）
  - [x] SubTask 5.3: 实现图片Base64编码和API请求逻辑
  - [x] SubTask 5.4: 实现VL响应解析和错误处理
  - [ ] SubTask 5.5: 使用assets/image1.png、image2.png进行测试验证

- [x] Task 6: Ollama LLM建议生成功能实现
  - [x] SubTask 6.1: 创建Ollama LLM API调用模块（qwen2.5模型）
  - [x] SubTask 6.2: 设计LLM Prompt模板（动态拼接环境数据和VL结果）
  - [x] SubTask 6.3: 实现知识库嵌入Prompt逻辑
  - [x] SubTask 6.4: 实现LLM响应解析和结构化输出

- [x] Task 7: 诊断主流程API实现
  - [x] SubTask 7.1: 实现POST /api/diagnose端点（multipart/form-data）
  - [x] SubTask 7.2: 实现图片上传和临时存储逻辑
  - [x] SubTask 7.3: 实现表单数据验证
  - [x] SubTask 7.4: 整合Ollama VL+LLM调用流程
  - [x] SubTask 7.5: 实现诊断结果保存（SQLite数据库）

- [x] Task 8: 前端诊断页面开发
  - [x] SubTask 8.1: 创建图片上传组件（支持拖拽、多文件、预览）
  - [x] SubTask 8.2: 创建环境数据表单组件（必填验证）
  - [x] SubTask 8.3: 创建诊断按钮和加载状态组件
  - [x] SubTask 8.4: 实现诊断API调用和错误处理

- [x] Task 9: 前端结果页面开发
  - [x] SubTask 9.1: 创建诊断结论卡片组件（生长阶段、健康评分、问题列表）
  - [x] SubTask 9.2: 创建个性化建议组件（四模块展示）
  - [x] SubTask 9.3: 创建原图展示组件
  - [x] SubTask 9.4: 实现保存诊断和重新诊断功能

- [x] Task 10: 历史记录功能实现
  - [x] SubTask 10.1: 实现GET /api/history端点
  - [x] SubTask 10.2: 实现GET /api/history/:id端点
  - [x] SubTask 10.3: 创建历史记录列表页面
  - [x] SubTask 10.4: 创建历史详情页面

- [x] Task 11: 知识科普模块开发
  - [x] SubTask 11.1: 创建知识科普页面布局
  - [x] SubTask 11.2: 创建生长阶段表格组件
  - [x] SubTask 11.3: 创建病害图谱组件（图片+症状+防治）
  - [x] SubTask 11.4: 创建搜索功能组件

- [x] Task 12: 首页开发
  - [x] SubTask 12.1: 创建首页Banner和介绍文案
  - [x] SubTask 12.2: 创建快速开始诊断入口
  - [x] SubTask 12.3: 创建功能特点展示区域

- [x] Task 13: 测试与验证
  - [x] SubTask 13.1: 使用assets/image1.png测试完整诊断流程
  - [x] SubTask 13.2: 使用assets/image2.png测试完整诊断流程
  - [x] SubTask 13.3: 进行移动端适配测试
  - [x] SubTask 13.4: 测试Ollama服务不可用时的错误处理

# Task Dependencies
- [Task 5] depends on [Task 4]
- [Task 6] depends on [Task 4, Task 5]
- [Task 7] depends on [Task 3, Task 5, Task 6]
- [Task 8] depends on [Task 2]
- [Task 9] depends on [Task 8]
- [Task 10] depends on [Task 7, Task 9]
- [Task 11] depends on [Task 4, Task 2]
- [Task 12] depends on [Task 2]
- [Task 13] depends on [Task 7, Task 8, Task 9, Task 10, Task 11, Task 12]
