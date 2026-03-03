import { useState, useEffect } from 'react'
import { Card, Tag, Spin, App, Empty } from 'antd'
import { BugOutlined } from '@ant-design/icons'
import api from '../../services/api'

const getSeverityColor = (severity) => {
  const colors = {
    '高': 'red',
    '中': 'orange',
    '低': 'green',
  }
  return colors[severity] || 'default'
}

const getTypeColor = (type) => {
  const colors = {
    '病毒': 'purple',
    '真菌': 'blue',
    '细菌': 'cyan',
    '生理性': 'green',
  }
  return colors[type] || 'default'
}

function Diseases({ searchTerm = '' }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { message } = App.useApp()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        let response
        // 如果有搜索词，使用后端智能搜索 API
        if (searchTerm && searchTerm.trim()) {
          response = await api.get('/api/knowledge/search', {
            params: { q: searchTerm.trim() }
          })
          // 从搜索结果中提取病害数据 (注意：api 拦截器已经解包了 response.data)
          const searchResults = response?.data?.diseases || []
          setData(searchResults)
        } else {
          // 无搜索词时获取全部数据
          response = await api.get('/api/knowledge/diseases')
          const dataArray = Array.isArray(response) ? response : 
                           (response && Array.isArray(response.data)) ? response.data : []
          setData(dataArray)
        }
      } catch (error) {
        message.error('获取病害数据失败')
        console.error(error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchTerm, message])

  return (
    <section 
      aria-labelledby="diseases-title"
      role="region"
      aria-label="病害知识库"
    >
      <h3 id="diseases-title" className="sr-only">
        烟草常见病害知识库
      </h3>
      
      <Spin spinning={loading} description={searchTerm ? "智能搜索中..." : "加载中..."}>
        {data.length === 0 ? (
          <Empty description={searchTerm ? "未找到匹配的病害" : "暂无病害数据"} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.map((disease, index) => (
              <article
                key={index}
                className="disease-card"
                aria-labelledby={`disease-${index}-title`}
                role="article"
              >
                <Card 
                  size="small"
                  className="h-full disease-card"
                  title={
                    <div className="flex items-center gap-2">
                      <BugOutlined className="text-red-500" aria-hidden="true" />
                      <span className="text-sm font-medium truncate">{disease.name}</span>
                      <Tag 
                        color={getSeverityColor(disease.severity)}
                        className="ml-2"
                        aria-label={`严重程度: ${disease.severity}`}
                      >
                        {disease.severity}
                      </Tag>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">类型</h4>
                      <Tag 
                        color={getTypeColor(disease.type)}
                        aria-label={`病害类型: ${disease.type}`}
                      >
                        {disease.type}
                      </Tag>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">症状表现</h4>
                      <p className="text-sm text-gray-600 line-clamp-2" aria-label={`${disease.name}的症状`}>
                        {disease.symptoms}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">预防措施</h4>
                      <p className="text-sm text-gray-600 line-clamp-2" aria-label={`${disease.name}的预防措施`}>
                        {disease.prevention}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">治疗方法</h4>
                      <p className="text-sm text-gray-600 line-clamp-2" aria-label={`${disease.name}的治疗方法`}>
                        {disease.treatment}
                      </p>
                    </div>
                  </div>
                </Card>
              </article>
            ))}
          </div>
        )}
      </Spin>
    </section>
  )
}

export default Diseases
