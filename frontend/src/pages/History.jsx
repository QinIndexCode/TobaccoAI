import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tag, Empty, Button, Image, Spin, App, Popconfirm } from 'antd'
import { ClockCircleOutlined, DeleteOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons'
import diagnoseApi from '../services/diagnose'

function History() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const response = await diagnoseApi.getHistory({ skip: 0, limit: 50 })
      setHistory(response || [])
    } catch (err) {
      console.error('获取历史记录失败:', err)
      message.error('获取历史记录失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHistory()
    setRefreshing(false)
  }

  const handleItemClick = (id) => {
    navigate(`/history/${id}`)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await diagnoseApi.deleteHistory(id)
      message.success('删除成功')
      setHistory(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('删除失败:', err)
      message.error('删除失败')
    }
  }

  const handleClearAll = async () => {
    try {
      const deletePromises = history.map(item => diagnoseApi.deleteHistory(item.id))
      await Promise.all(deletePromises)
      message.success('已清空所有记录')
      setHistory([])
    } catch (err) {
      console.error('清空失败:', err)
      message.error('清空失败')
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

  const getMainIssue = (vlResult) => {
    if (!vlResult || !vlResult.issues || vlResult.issues.length === 0) {
      return { name: '健康', severity: '低' }
    }
    const mainIssue = vlResult.issues.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    )
    return mainIssue
  }

  const getConfidenceTag = (confidence) => {
    if (confidence >= 0.9) return <Tag color="green">高置信度</Tag>
    if (confidence >= 0.7) return <Tag color="orange">中置信度</Tag>
    return <Tag color="red">低置信度</Tag>
  }

  const getSeverityTag = (severity) => {
    const config = {
      '低': { color: 'success', text: '轻微' },
      '中': { color: 'warning', text: '中等' },
      '高': { color: 'error', text: '严重' },
    }
    const cfg = config[severity] || { color: 'default', text: severity }
    return <Tag color={cfg.color}>{cfg.text}</Tag>
  }

  const getThumbnail = (imagePaths) => {
    if (!imagePaths || imagePaths.length === 0) return null
    const firstImage = imagePaths[0]
    if (firstImage.startsWith('http')) return firstImage
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return `${baseUrl}/${firstImage}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">诊断历史</h1>
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            刷新
          </Button>
        </div>

        {history.length === 0 ? (
          <Card>
            <Empty
              description="暂无诊断记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/diagnose')}>
                开始诊断
              </Button>
            </Empty>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const mainIssue = getMainIssue(item.vl_result)
              const thumbnail = getThumbnail(item.image_paths)
              const confidence = mainIssue.confidence || 0

              return (
                <Card 
                  key={item.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt="缩略图"
                          className="w-full h-full object-cover"
                          width={80}
                          height={80}
                          style={{ objectFit: 'cover' }}
                          preview={false}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">
                          无图片
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-gray-800 truncate pr-2">
                          {mainIssue.name}
                        </h3>
                        <RightOutlined className="text-gray-400 text-xs shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityTag(mainIssue.severity)}
                        {confidence > 0 && getConfidenceTag(confidence)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockCircleOutlined className="mr-1" />
                        {formatDate(item.created_at)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          健康评分: {item.vl_result?.leaf_health || '-'}分
                        </span>
                        <Popconfirm
                          title="确定删除此记录？"
                          onConfirm={(e) => handleDelete(e, item.id)}
                          onCancel={(e) => e.stopPropagation()}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {history.length > 0 && (
          <div className="text-center mt-4">
            <Popconfirm
              title="确定清空所有记录？"
              description="此操作不可恢复"
              onConfirm={handleClearAll}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>
                清空所有记录
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
