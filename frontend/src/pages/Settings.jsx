import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Space, message, Alert, Select } from 'antd'
// Button 组件已导入，可用于操作按钮
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ApiOutlined,
  CloudOutlined,
} from '@ant-design/icons'

const { Option } = Select

/**
 * 开发者配置页面
 * 支持配置 Ollama 本地服务或第三方 API 服务商
 */
const Settings = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [config, setConfig] = useState(null)
  const [availableModels, setAvailableModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [initialized, setInitialized] = useState(false) // 标记是否已初始化
  const [providerType, setProviderType] = useState('ollama-local') // 用于控制表单显示

  // 服务商选项
  const providers = [
    { value: 'ollama-local', label: 'Ollama 本地部署' },
    { value: 'ollama-remote', label: 'Ollama 远程服务' },
    { value: 'openai-compatible', label: 'OpenAI 兼容 API' },
  ]

  // 加载配置
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        // 先加载可用模型列表，并验证当前模型是否存在
        const result = await loadAvailableModels(data.ollamaBaseUrl, data.vlModel, data.llmModel, false)
        
        // 确保模型列表加载完成后再设置表单值，使用验证后的模型值
        if (result.models && result.models.length > 0) {
          // 延迟一下确保 Select 组件已渲染
          setTimeout(() => {
            form.setFieldsValue({
              provider: data.provider,
              ollamaBaseUrl: data.ollamaBaseUrl,
              vlModel: result.vlModel,  // 使用验证后的模型
              llmModel: result.llmModel,  // 使用验证后的模型
            })
            setProviderType(data.provider || 'ollama-local')
            setInitialized(true)
          }, 100)
        } else {
          form.setFieldsValue(data)
          setProviderType(data.provider || 'ollama-local')
          setInitialized(true)
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      setInitialized(true)
    }
  }

  const loadAvailableModels = async (baseUrl, currentVlModel, currentLlmModel, showMessage = true) => {
    if (!baseUrl) return { models: [], vlModel: currentVlModel, llmModel: currentLlmModel }
    
    setLoadingModels(true)
    try {
      const response = await fetch(`${baseUrl}/api/tags`)
      if (response.ok) {
        const data = await response.json()
        const models = data.models || []
        
        // 获取每个模型的详细信息
        const modelsWithDetails = await Promise.all(
          models.map(async (model) => {
            try {
              const detailResponse = await fetch(`${baseUrl}/api/show`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: model.name }),
              })
              
              if (detailResponse.ok) {
                const detailData = await detailResponse.json()
                return {
                  name: model.name,
                  size: model.size,
                  modified: model.modified_at,
                  details: detailData.details || {},
                  capabilities: detailData.capabilities || [],
                }
              }
              return {
                name: model.name,
                size: model.size,
                modified: model.modified_at,
                details: {},
                capabilities: [],
              }
            } catch (error) {
              console.error(`获取模型 ${model.name} 详情失败:`, error)
              return {
                name: model.name,
                size: model.size,
                modified: model.modified_at,
                details: {},
                capabilities: [],
              }
            }
          })
        )
        
        setAvailableModels(modelsWithDetails)
        
        // 验证当前模型是否在可用列表中（始终验证，但只在需要时显示提示）
        const modelNames = modelsWithDetails.map(m => m.name)
        let newVlModel = currentVlModel
        let newLlmModel = currentLlmModel
        
        // 如果当前模型不存在，计算应该使用的模型
        if (!currentVlModel || !modelNames.includes(currentVlModel)) {
          newVlModel = modelsWithDetails.find(m => m.capabilities?.includes('vision') || m.name.includes('vl'))?.name
        }
        
        if (!currentLlmModel || !modelNames.includes(currentLlmModel)) {
          newLlmModel = modelNames[0] || undefined
        }
        
        // 只在初始化后且用户手动触发时显示警告
        if (showMessage && initialized) {
          // 如果模型有变化，更新表单并提示
          if (newVlModel !== currentVlModel || newLlmModel !== currentLlmModel) {
            form.setFieldsValue({
              vlModel: newVlModel,
              llmModel: newLlmModel,
            })
            if (currentVlModel && !modelNames.includes(currentVlModel)) {
              message.warning(`当前视觉模型 ${currentVlModel} 不存在，已切换到 ${newVlModel}`)
            }
            if (currentLlmModel && !modelNames.includes(currentLlmModel)) {
              message.warning(`当前语言模型 ${currentLlmModel} 不存在，已切换到 ${newLlmModel}`)
            }
          }
        }
        
        // 返回模型列表和验证后的模型名称
        return {
          models: modelsWithDetails,
          vlModel: newVlModel,
          llmModel: newLlmModel,
        }
      } else {
        setAvailableModels([])
        return { models: [], vlModel: currentVlModel, llmModel: currentLlmModel }
      }
    } catch (error) {
      console.error('加载模型列表失败:', error)
      setAvailableModels([])
      return { models: [], vlModel: currentVlModel, llmModel: currentLlmModel }
    } finally {
      setLoadingModels(false)
    }
  }

  // 保存配置
  const handleSave = async (values) => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        message.success('配置保存成功！')
        setConfig(values)
      } else {
        message.error('保存失败，请重试')
      }
    } catch (error) {
      message.error('保存失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 测试连接
  const handleTestConnection = async () => {
    const values = form.getFieldsValue()
    setTestingConnection(true)

    try {
      const response = await fetch('/api/settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        message.success(`连接测试成功！${data.message || ''}`)
      } else {
        message.error(`连接测试失败：${data.message || '无法连接到服务'}`)
      }
    } catch (error) {
      message.error('连接测试失败：' + error.message)
    } finally {
      setTestingConnection(false)
    }
  }

  // 重置为默认配置
  const handleReset = () => {
    const defaultConfig = {
      provider: 'ollama-local',
      ollamaBaseUrl: 'http://localhost:11434',
      vlModel: 'qwen2.5-vl',
      llmModel: 'qwen2.5',
      apiBaseUrl: '',
      apiKey: '',
    }
    form.setFieldsValue(defaultConfig)
    message.info('已重置为默认配置')
  }

  // OpenAI 兼容 API 的常见模型选项
  const openAIModels = [
    { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)' },
    { value: 'gpt-4-vision-preview', label: 'GPT-4 Vision (OpenAI)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)' },
    { value: 'qwen-vl-max', label: 'Qwen-VL-Max (通义千问)' },
    { value: 'qwen-vl-plus', label: 'Qwen-VL-Plus (通义千问)' },
    { value: 'qwen-max', label: 'Qwen-Max (通义千问)' },
    { value: 'qwen-plus', label: 'Qwen-Plus (通义千问)' },
    { value: 'deepseek-vl', label: 'DeepSeek-VL (深度求索)' },
    { value: 'deepseek-chat', label: 'DeepSeek-Chat (深度求索)' },
  ]

  const visionOpenAIModels = openAIModels.filter(m => 
    m.value.includes('vision') || m.value.includes('vl') || m.value.includes('4o')
  )

  // 监听服务商变化
  const handleProviderChange = (value) => {
    form.setFieldsValue({ provider: value })
    setProviderType(value)
    // 根据服务商类型显示不同的配置项
    if (value === 'openai-compatible') {
      // OpenAI 兼容模式，显示 API Key 配置
      loadAvailableModels('http://localhost:11434', form.getFieldValue('vlModel'), form.getFieldValue('llmModel'), false)
    } else {
      // Ollama 模式，显示 Ollama 配置
      const baseUrl = form.getFieldValue('ollamaBaseUrl')
      if (baseUrl) {
        loadAvailableModels(baseUrl, form.getFieldValue('vlModel'), form.getFieldValue('llmModel'), false)
      }
    }
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>
          <SettingOutlined />
          开发者配置
        </h1>
        <p>配置 AI 模型服务和本地 Ollama 连接</p>
      </div>

      <Alert
        title="配置说明"
        description={
          <div>
            <p>• <strong>Ollama 本地部署</strong>：使用本机运行的 Ollama 服务（推荐）</p>
            <p>• <strong>Ollama 远程服务</strong>：使用远程服务器的 Ollama 服务</p>
            <p>• <strong>OpenAI 兼容 API</strong>：使用第三方 API 服务商（如 OpenAI、DeepSeek 等）</p>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <div className="settings-grid">
        {/* 基础配置 */}
        <Card
          title={
            <span>
              <CloudOutlined /> 服务配置
            </span>
          }
          className="settings-card"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              provider: 'ollama-local',
              ollamaBaseUrl: 'http://localhost:11434',
              vlModel: 'qwen2.5-vl',
              llmModel: 'qwen2.5',
            }}
          >
            <Form.Item
              name="provider"
              label="服务商类型"
              rules={[{ required: true, message: '请选择服务商类型' }]}
              extra="推荐使用 Ollama 本地部署，数据隐私更安全"
            >
              <Select 
                size="large"
                onChange={handleProviderChange}
              >
                {providers.map((provider) => (
                  <Option key={provider.value} value={provider.value}>
                    {provider.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Ollama 配置项 */}
            {providerType !== 'openai-compatible' && (
              <Form.Item
                name="ollamaBaseUrl"
                label="Ollama 服务地址"
                rules={[
                  { required: true, message: '请输入 Ollama 服务地址' },
                  { pattern: /^https?:\/\/.+/, message: '请输入有效的 URL 地址' },
                ]}
                extra="Ollama 服务的完整地址，包括端口号"
              >
                <Input
                  size="large"
                  placeholder="http://localhost:11434"
                  prefix={<ApiOutlined />}
                  onBlur={(e) => {
                    const baseUrl = e.target.value
                    const currentValues = form.getFieldsValue()
                    loadAvailableModels(baseUrl, currentValues.vlModel, currentValues.llmModel, true)
                  }}
                />
              </Form.Item>
            )}

            {/* OpenAI 兼容配置项 */}
            {providerType === 'openai-compatible' && (
              <>
                <Form.Item
                  name="apiBaseUrl"
                  label="API 基础地址"
                  rules={[
                    { required: true, message: '请输入 API 基础地址' },
                    { pattern: /^https?:\/\/.+/, message: '请输入有效的 URL 地址' },
                  ]}
                  extra="第三方 API 服务商的基础地址（如：https://api.openai.com/v1）"
                >
                  <Input
                    size="large"
                    placeholder="https://api.openai.com/v1"
                    prefix={<ApiOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="apiKey"
                  label="API Key"
                  rules={[{ required: true, message: '请输入 API Key' }]}
                  extra="您的 API 密钥，请妥善保管"
                >
                  <Input.Password
                    size="large"
                    placeholder="sk-..."
                    prefix={<ApiOutlined />}
                    autoComplete="current-password"
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              name="vlModel"
              label="视觉模型"
              rules={[{ required: true, message: '请选择视觉模型' }]}
              extra={providerType === 'openai-compatible' 
                ? "用于图像识别的模型，如 GPT-4V、Qwen-VL 等"
                : "用于图像识别的模型，建议选择具有视觉能力的模型"
              }
            >
              <Select
                size="large"
                placeholder="请选择视觉模型"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={providerType === 'openai-compatible'
                  ? visionOpenAIModels
                  : availableModels
                      .filter(m => m.capabilities?.includes('vision') || m.name.includes('vl'))
                      .map(m => ({
                        value: m.name,
                        label: m.name,
                        disabled: false,
                      }))
                }
                notFoundContent={loadingModels ? '加载中...' : '暂无视觉模型'}
              />
            </Form.Item>

            <Form.Item
              name="llmModel"
              label="语言模型"
              rules={[{ required: true, message: '请选择语言模型' }]}
              extra={providerType === 'openai-compatible' 
                ? "用于文本生成的模型，如 GPT-4、Qwen 等"
                : "用于文本生成的模型，建议选择性能较好的语言模型（如 qwen2.5）"
              }
            >
              <Select
                size="large"
                placeholder="请选择语言模型"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={providerType === 'openai-compatible'
                  ? openAIModels
                  : availableModels.map(m => ({
                      value: m.name,
                      label: m.name,
                      disabled: false,
                    }))
                }
                notFoundContent={loadingModels ? '加载中...' : '暂无模型'}
              />
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="settings-actions">
        <Space size="middle">
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={loading}
          >
            保存配置
          </Button>

          <Button
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleTestConnection}
            loading={testingConnection}
          >
            测试连接
          </Button>

          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            重置默认
          </Button>
        </Space>
      </div>

      {/* 当前配置信息 */}
      {config && (
        <Card
          title="当前配置"
          size="small"
          className="mt-6"
        >
          <Space orientation="vertical" style={{ width: '100%' }}>
            <div>
              <strong>服务商：</strong>{' '}
              {config.provider === 'ollama-local' && 'Ollama 本地部署'}
              {config.provider === 'ollama-remote' && 'Ollama 远程服务'}
              {config.provider === 'openai-compatible' && 'OpenAI 兼容 API'}
            </div>
            {config.provider !== 'openai-compatible' ? (
              <div>
                <strong>服务地址：</strong> {config.ollamaBaseUrl || '未配置'}
              </div>
            ) : (
              <>
                <div>
                  <strong>API 地址：</strong> {config.apiBaseUrl || '未配置'}
                </div>
                <div>
                  <strong>API Key：</strong> {config.apiKey ? `${config.apiKey.substring(0, 8)}...` : '未配置'}
                </div>
              </>
            )}
            <div>
              <strong>视觉模型：</strong> {config.vlModel || '未配置'}
            </div>
            <div>
              <strong>语言模型：</strong> {config.llmModel || '未配置'}
            </div>
          </Space>
        </Card>
      )}

      {/* 可用模型列表 */}
      <Card
        title="可用模型"
        size="small"
        className="mt-6"
      >
        {loadingModels ? (
          <div className="text-center py-4">
            <p className="text-gray-500">正在加载模型列表...</p>
          </div>
        ) : availableModels.length > 0 ? (
          <div className="space-y-2">
            {availableModels.map((model, index) => {
              // 判断是否为视觉模型
              const isVisionModel = model.capabilities?.includes('vision') || model.name.includes('vl')
              
              // 计算模型大小（GB）
              const sizeGB = model.size ? (model.size / 1024 / 1024 / 1024) : 0
              const isCloudModel = sizeGB < 0.01  // 小于 0.01GB 的视为云端模型
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {isCloudModel ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded font-medium">
                          ☁️ 云端模型
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {sizeGB.toFixed(2)} GB
                        </span>
                      )}
                      {isVisionModel && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded font-medium">
                          视觉
                        </span>
                      )}
                      {model.capabilities?.includes('tool_use') && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded font-medium">
                          工具调用
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      type="link"
                      onClick={() => {
                        form.setFieldsValue({
                          vlModel: isVisionModel ? model.name : undefined,
                          llmModel: model.name,
                        })
                        message.success(`已选择模型：${model.name}`)
                      }}
                    >
                      选择
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">
              {config?.ollamaBaseUrl
                ? '未找到可用模型，请检查 Ollama 服务是否正常运行'
                : '请先配置 Ollama 服务地址'}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Settings
