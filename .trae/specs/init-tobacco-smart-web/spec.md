# 烟智通（TobaccoSmart Web）规格文档

## Why
烟农传统依赖经验进行种植管理，病害识别慢、建议不精准，缺乏专业指导工具。本项目旨在打造一款集成视觉语言模型（VL）与大语言模型（LLM）的Web端AI辅助决策工具，实现"拍照即诊断、输入即建议"，助力烟农精准管理、减少损失、绿色生产，直接服务乡村振兴。

## What Changes
- 创建React前端应用（Vite + TailwindCSS + Ant Design）
- 创建FastAPI后端服务
- 集成Ollama本地部署的qwen2.5vl进行图像分析
- 集成Ollama本地部署的qwen2.5进行LLM推理
- 实现诊断主流程（图片上传+环境表单+AI诊断）
- 实现诊断结果结构化展示
- 实现历史记录功能（本地存储）
- 创建烟草知识库（生长阶段、病害、缺素）
- 实现知识科普静态页面
- 提供测试图片（assets/image1.png、assets/image2.png）

## Impact
- Affected specs: 新建项目，无影响现有规格
- Affected code: 全新代码库

## Technical Stack
- **前端**: React 18 + Vite + TailwindCSS + Ant Design
- **后端**: FastAPI + Uvicorn
- **VL模型**: Ollama + qwen2.5vl（本地部署）
- **LLM模型**: Ollama + qwen2.5（本地部署）
- **数据库**: SQLite（MVP）
- **测试图片**: assets/image1.png、assets/image2.png

## ADDED Requirements

### Requirement: Ollama本地模型集成
系统应使用Ollama本地部署的模型进行AI推理。

#### Scenario: VL模型调用
- **WHEN** 系统需要分析烟草图片
- **THEN** 调用本地Ollama qwen2.5vl模型（默认地址http://localhost:11434）

#### Scenario: LLM模型调用
- **WHEN** 系统需要生成种植建议
- **THEN** 调用本地Ollama qwen2.5模型

#### Scenario: Ollama服务不可用
- **WHEN** Ollama服务未启动或不可达
- **THEN** 显示友好错误提示"AI服务未启动，请确保Ollama正在运行"

### Requirement: 用户界面
系统应提供响应式Web界面，支持手机浏览器优先访问。

#### Scenario: 访问首页
- **WHEN** 用户通过浏览器访问系统URL
- **THEN** 显示首页，包含"开始诊断"入口和导航菜单

#### Scenario: 移动端适配
- **WHEN** 用户使用手机浏览器访问
- **THEN** 界面自适应屏幕宽度，按钮和字体大小适合触控操作

### Requirement: 图片上传功能
系统应支持用户上传烟草照片进行分析。

#### Scenario: 上传单张图片
- **WHEN** 用户点击上传区域选择一张jpg/png图片（≤5MB）
- **THEN** 显示图片预览缩略图

#### Scenario: 上传多张图片
- **WHEN** 用户连续选择1-3张图片
- **THEN** 显示所有图片预览，支持删除单张

#### Scenario: 上传格式错误
- **WHEN** 用户上传非jpg/png格式或超过5MB的文件
- **THEN** 显示错误提示"仅支持jpg/png格式，单张不超过5MB"

#### Scenario: 使用测试图片
- **WHEN** 开发测试时
- **THEN** 可使用assets/image1.png或assets/image2.png作为测试图片

### Requirement: 环境数据表单
系统应收集烟草生长环境数据用于诊断。

#### Scenario: 填写必填项
- **WHEN** 用户填写生长阶段、气温、空气湿度、土壤湿度
- **THEN** 表单验证通过

#### Scenario: 必填项为空
- **WHEN** 用户未填写必填项即提交
- **THEN** 显示红色边框和"请填写此项"提示

#### Scenario: 可选项填写
- **WHEN** 用户填写土壤pH（5.0-7.5）和其他备注
- **THEN** 数据被记录用于诊断

### Requirement: VL图像诊断
系统应调用Ollama qwen2.5vl模型分析烟草图片。

#### Scenario: VL诊断成功
- **WHEN** 用户提交诊断请求
- **THEN** 系统调用Ollama qwen2.5vl，返回结构化JSON结果（生长阶段、健康评分、问题列表）

#### Scenario: VL诊断超时
- **WHEN** Ollama响应超过60秒
- **THEN** 显示"诊断服务暂时繁忙，请稍后重试"

### Requirement: LLM建议生成
系统应调用Ollama qwen2.5模型生成个性化种植建议。

#### Scenario: LLM生成成功
- **WHEN** VL诊断完成
- **THEN** 系统调用Ollama qwen2.5，综合VL结果+环境数据+知识库生成建议

#### Scenario: 建议模块完整
- **WHEN** LLM返回建议
- **THEN** 包含灌溉方案、施肥方案、病虫害防控、其他管理四个模块

### Requirement: 诊断结果展示
系统应结构化展示诊断结果。

#### Scenario: 显示诊断结论
- **WHEN** 诊断完成
- **THEN** 显示原图、生长阶段判断、健康评分（0-100）、问题列表（名称、症状、严重程度、置信度）

#### Scenario: 显示个性化建议
- **WHEN** 诊断完成
- **THEN** 分模块显示灌溉、施肥、病虫害防控、其他管理建议

#### Scenario: 保存诊断记录
- **WHEN** 用户点击"保存本次诊断"
- **THEN** 记录存入本地数据库，显示"保存成功"

### Requirement: 历史记录管理
系统应支持用户查看历史诊断记录。

#### Scenario: 查看历史列表
- **WHEN** 用户进入历史记录页面
- **THEN** 按时间倒序显示诊断记录（缩略图+简要结论）

#### Scenario: 查看历史详情
- **WHEN** 用户点击某条记录
- **THEN** 显示完整诊断结果

### Requirement: 知识科普模块
系统应提供烟草种植知识科普内容。

#### Scenario: 浏览生长阶段表
- **WHEN** 用户进入知识科普页面
- **THEN** 显示烟草各生长阶段环境要求表格

#### Scenario: 浏览病害图谱
- **WHEN** 用户查看常见病害
- **THEN** 显示10种病害的图片、症状、防治方法

#### Scenario: 搜索知识
- **WHEN** 用户在搜索框输入关键词
- **THEN** 快速定位匹配的知识内容

### Requirement: 性能与安全
系统应满足性能和安全要求。

#### Scenario: 响应时间
- **WHEN** 用户发起诊断请求
- **THEN** 响应时间取决于本地Ollama模型推理速度

#### Scenario: 本地部署安全
- **WHEN** 系统运行
- **THEN** 所有AI推理在本地完成，无需外部API密钥

#### Scenario: 图片临时存储
- **WHEN** 用户上传图片
- **THEN** 图片临时存储在本地，可配置清理策略

## MODIFIED Requirements
无（新建项目）

## REMOVED Requirements
无（新建项目）
