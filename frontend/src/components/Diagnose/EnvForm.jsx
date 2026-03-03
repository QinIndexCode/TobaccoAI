import { Form, DatePicker, Select, Input } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import NumberInput from './NumberInput'
import { useState } from 'react'

const { TextArea } = Input
const { Option } = Select

const growthStages = [
  { value: '苗期', label: '苗期' },
  { value: '团棵期', label: '团棵期' },
  { value: '旺长期', label: '旺长期' },
  { value: '打顶期', label: '打顶期' },
  { value: '成熟期', label: '成熟期' },
]

const EnvForm = ({ form, initialValues }) => {
  const [validationResults, setValidationResults] = useState({})
  const [validating, setValidating] = useState(false)

  // 验证环境数据
  const validateEnvironmentData = async (values) => {
    if (!values.temperature || !values.airHumidity) {
      setValidationResults({})
      return
    }

    try {
      setValidating(true)
      const params = new URLSearchParams({
        temperature: values.temperature,
        air_humidity: values.airHumidity,
      })
      if (values.soilHumidity) params.append('soil_humidity', values.soilHumidity)
      if (values.soilPH) params.append('soil_ph', values.soilPH)

      const response = await fetch(`/api/weather/validate?${params}`)
      if (response.ok) {
        const data = await response.json()
        setValidationResults(data)
      }
    } catch (error) {
      console.error('验证失败:', error)
    } finally {
      setValidating(false)
    }
  }

  // 监听表单值变化
  const handleValuesChange = (changedValues, allValues) => {
    // 当环境数据变化时进行验证
    if (changedValues.temperature || changedValues.airHumidity || 
        changedValues.soilHumidity || changedValues.soilPH) {
      validateEnvironmentData(allValues)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        date: dayjs(),
        growthStage: undefined,
        temperature: undefined,
        airHumidity: undefined,
        soilHumidity: undefined,
        soilPH: undefined,
        notes: '',
        ...initialValues,
      }}
      className="env-form"
      aria-label="环境数据表单"
      onValuesChange={handleValuesChange}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="date"
          label="当前日期"
          rules={[{ required: true, message: '请选择日期' }]}
          className="mb-4"
          required
          aria-required="true"
        >
          <DatePicker 
            className="w-full" 
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            aria-label="当前日期"
          />
        </Form.Item>

        <Form.Item
          name="growthStage"
          label="生长阶段"
          rules={[{ required: true, message: '请选择生长阶段' }]}
          className="mb-4"
          required
          aria-required="true"
        >
          <Select 
            placeholder="请选择生长阶段"
            aria-label="生长阶段"
          >
            {growthStages.map(stage => (
              <Option key={stage.value} value={stage.value}>
                {stage.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="temperature"
          label="气温"
          rules={[{ required: true, message: '请输入气温' }]}
          className="mb-4"
          required
          aria-required="true"
          extra="请输入 -20 到 50 之间的数值"
        >
          <NumberInput
            placeholder="请输入气温"
            min={-20}
            max={50}
            precision={1}
            step={0.1}
            unit="℃"
            aria-label="气温（摄氏度）"
          />
        </Form.Item>

        <Form.Item
          name="airHumidity"
          label="空气湿度"
          rules={[{ required: true, message: '请输入空气湿度' }]}
          className="mb-4"
          required
          aria-required="true"
          extra="请输入 0 到 100 之间的数值"
        >
          <NumberInput
            placeholder="请输入空气湿度"
            min={0}
            max={100}
            step={1}
            unit="%"
            aria-label="空气湿度（百分比）"
          />
        </Form.Item>

        <Form.Item
          name="soilHumidity"
          label="土壤湿度"
          rules={[{ required: true, message: '请输入土壤湿度' }]}
          className="mb-4"
          required
          aria-required="true"
          extra="请输入 0 到 100 之间的数值"
        >
          <NumberInput
            placeholder="请输入土壤湿度"
            min={0}
            max={100}
            step={1}
            unit="%"
            aria-label="土壤湿度（百分比）"
          />
        </Form.Item>

        <Form.Item
          name="soilPH"
          label="土壤 pH"
          className="mb-4"
          extra="可选，请输入 5.0 到 7.5 之间的数值"
        >
          <NumberInput
            placeholder="请输入土壤 pH（可选）"
            min={5.0}
            max={7.5}
            step={0.1}
            precision={1}
            aria-label="土壤 pH 值（可选）"
          />
        </Form.Item>
      </div>

      <Form.Item
        name="notes"
        label="其他备注"
        className="mb-0"
        extra="可选，最多 500 字"
      >
        <TextArea
          placeholder="请输入其他备注信息（可选）"
          rows={3}
          maxLength={500}
          showCount
          aria-label="其他备注（可选）"
        />
      </Form.Item>

      {/* 验证结果显示 */}
      {(validationResults.severity || validating) && (
        <div className="mt-4 p-4 rounded-lg border" style={{
          background: validationResults.severity === 'error' ? '#fef2f2' : 
                     validationResults.severity === 'warning' ? '#fffbeb' : 
                     validationResults.severity === 'ok' ? '#f0fdf4' : '#f3f4f6',
          borderColor: validationResults.severity === 'error' ? '#fecaca' : 
                      validationResults.severity === 'warning' ? '#fde68a' : 
                      validationResults.severity === 'ok' ? '#bbf7d0' : '#e5e7eb',
        }}>
          {validating ? (
            <div className="flex items-center gap-2 text-gray-600">
              <ReloadOutlined spin />
              <span>正在验证数据...</span>
            </div>
          ) : (
            <>
              {validationResults.severity === 'error' && (
                <div className="flex items-start gap-2 text-red-800 mb-2">
                  <span className="text-lg font-bold">⚠️</span>
                  <div>
                    <div className="font-semibold mb-1">数据存在问题</div>
                    {validationResults.issues?.map((issue, idx) => (
                      <div key={idx} className="text-sm mb-1">• {issue}</div>
                    ))}
                  </div>
                </div>
              )}
              {validationResults.severity === 'warning' && (
                <div className="flex items-start gap-2 text-amber-800 mb-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <div className="font-semibold mb-1">数据可能不太合理</div>
                    {validationResults.warnings?.map((warning, idx) => (
                      <div key={idx} className="text-sm mb-1">• {warning}</div>
                    ))}
                  </div>
                </div>
              )}
              {validationResults.severity === 'ok' && (
                <div className="flex items-start gap-2 text-green-800">
                  <span className="text-lg">✅</span>
                  <div>
                    <div className="font-semibold mb-1">数据验证通过</div>
                    <div className="text-sm">所有环境数据都在合理范围内</div>
                  </div>
                </div>
              )}
              {validationResults.suggestions?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">💡 建议：</div>
                  {validationResults.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="text-sm text-gray-600 mb-1">• {suggestion}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Form>
  )
}

export default EnvForm
