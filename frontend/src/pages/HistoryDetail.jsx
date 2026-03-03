import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spin, Result as AntResult, Card, Descriptions, Tag, Popconfirm, message } from 'antd'
import {  
  ArrowLeftOutlined, 
  DeleteOutlined,
  CalendarOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import { DiagnosisCard, SuggestionSection, ImageGallery } from '../components/result'
import diagnoseApi from '../services/diagnose'

function HistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [diagnosisData, setDiagnosisData] = useState(null)

  const fetchDiagnosisDetail = useCallback(async () => {
    if (!id) {
      setError('缺少诊断ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await diagnoseApi.getDiagnosisById(id)
      setDiagnosisData(response)
    } catch (err) {
      console.error('获取诊断详情失败:', err)
      setError(err.response?.data?.detail || '获取诊断详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDiagnosisDetail()
  }, [fetchDiagnosisDetail])

  const handleDelete = async () => {
    try {
      await diagnoseApi.deleteHistory(id)
      message.success('删除成功')
      navigate('/history')
    } catch (err) {
      console.error('删除失败:', err)
      message.error('删除失败')
    }
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
          <div className="mt-4 text-gray-500">正在加载诊断详情...</div>
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
            <Button type="primary" key="retry" onClick={fetchDiagnosisDetail}>
              重新加载
            </Button>,
            <Button key="back" onClick={() => navigate('/history')}>
              返回列表
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
            <Button type="primary" key="history" onClick={() => navigate('/history')}>
              返回历史列表
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/history')}
            >
              返回列表
            </Button>
          </div>
          <Popconfirm
            title="确定删除此记录？"
            description="删除后无法恢复"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除记录
            </Button>
          </Popconfirm>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">诊断详情</h1>
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
              onClick={() => navigate('/diagnose')}
              block
              className="sm:flex-1"
            >
              开始新诊断
            </Button>
            <Button 
              onClick={() => navigate('/history')}
              block
              className="sm:flex-1"
            >
              返回历史列表
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default HistoryDetail
