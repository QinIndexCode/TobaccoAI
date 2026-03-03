import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Spin, Result as AntResult, App, Card, Descriptions, Tag } from 'antd'
import { 
  CheckCircleOutlined, 
  RedoOutlined, 
  CalendarOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import { DiagnosisCard, SuggestionSection, ImageGallery } from '../components/result'
import diagnoseApi from '../services/diagnose'
 
function Result() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [diagnosisData, setDiagnosisData] = useState(null)

  const diagnosisId = searchParams.get('id')

  const fetchDiagnosisResult = useCallback(async () => {
    if (!diagnosisId) {
      setError('缺少诊断ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await diagnoseApi.getResult(diagnosisId)
      setDiagnosisData(response)
    } catch (err) {
      console.error('获取诊断结果失败:', err)
      setError(err.response?.data?.detail || '获取诊断结果失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [diagnosisId])

  useEffect(() => {
    fetchDiagnosisResult()
  }, [fetchDiagnosisResult])

  const handleSave = () => {
    message.success('诊断结果已自动保存到历史记录')
  }

  const handleRediagnose = () => {
    navigate('/diagnose')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">正在加载诊断结果...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <AntResult
          status="error"
          title="加载失败"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" onClick={fetchDiagnosisResult}>
              重新加载
            </Button>,
            <Button key="back" onClick={() => navigate('/diagnose')}>
              返回诊断
            </Button>,
          ]}
        />
      </div>
    )
  }

  if (!diagnosisData) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <AntResult
          status="warning"
          title="未找到诊断记录"
          subTitle="该诊断记录可能已被删除或不存在"
          extra={[
            <Button type="primary" key="diagnose" onClick={() => navigate('/diagnose')}>
              开始新诊断
            </Button>,
          ]}
        />
      </div>
    )
  }

  const { vl_result, llm_suggestion, image_paths, request_data, created_at } = diagnosisData

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">诊断结果</h1>
          <p className="text-gray-500">
            诊断时间：{formatDate(created_at)}
          </p>
        </div>

        <Card className="mb-4">
          <Descriptions 
            column={{ xs: 2, sm: 3, md: 4 }} 
            size="small"
            styles={{ label: { color: '#6b7280' } }}
          >
            <Descriptions.Item label={<><CalendarOutlined className="mr-1" />日期</>}>
              {request_data?.date || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<><ExperimentOutlined className="mr-1" />生长阶段</>}>
              <Tag color="green">{request_data?.growth_stage || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<><CloudOutlined className="mr-1" />气温</>}>
              {request_data?.temperature ? `${request_data.temperature}°C` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<><ThunderboltOutlined className="mr-1" />空气湿度</>}>
              {request_data?.air_humidity ? `${request_data.air_humidity}%` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="土壤湿度">
              {request_data?.soil_humidity ? `${request_data.soil_humidity}%` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="土壤pH">
              {request_data?.soil_ph || '-'}
            </Descriptions.Item>
          </Descriptions>
          {request_data?.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-gray-500 text-sm">备注：</span>
              <span className="text-gray-700 text-sm ml-2">{request_data.notes}</span>
            </div>
          )}
        </Card>

        <ImageGallery images={image_paths} />

        <DiagnosisCard vlResult={vl_result} />

        <SuggestionSection llmSuggestion={llm_suggestion} />

        <Card className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={handleSave}
              block
              className="sm:flex-1"
            >
              保存本次诊断
            </Button>
            <Button 
              icon={<RedoOutlined />}
              onClick={handleRediagnose}
              block
              className="sm:flex-1"
            >
              重新诊断
            </Button>
          </div>
          <div className="mt-3 text-center text-xs text-gray-400">
            诊断结果已自动保存到历史记录
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Result
