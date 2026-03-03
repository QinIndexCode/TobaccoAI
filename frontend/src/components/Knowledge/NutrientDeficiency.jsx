import { useState, useEffect } from 'react'
import { Collapse, Spin, Empty, Tag, App } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import api from '../../services/api'

function NutrientDeficiency({ searchTerm = '' }) {
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
          // 从搜索结果中提取营养缺乏数据 (注意：api 拦截器已经解包了 response.data)
          const searchResults = response?.data?.nutrients || []
          setData(searchResults)
        } else {
          // 无搜索词时获取全部数据
          response = await api.get('/api/knowledge/nutrients')
          const dataArray = Array.isArray(response) ? response : 
                           (response && Array.isArray(response.data)) ? response.data : []
          setData(dataArray)
        }
      } catch (error) {
        message.error('获取营养缺素数据失败')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchTerm, message])

  const collapseItems = data.map((item, index) => ({
    key: String(index),
    label: (
      <div className="flex items-center gap-2">
        <Tag color="orange">{item.name}</Tag>
        <span className="text-xs text-gray-500 truncate">
          {item.symptoms?.substring(0, 20)}...
        </span>
      </div>
    ),
    children: (
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">症状表现</h4>
          <p className="text-sm text-gray-600">{item.symptoms}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">预防措施</h4>
          <p className="text-sm text-gray-600">{item.prevention}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">治疗方法</h4>
          <p className="text-sm text-gray-600">{item.treatment}</p>
        </div>
      </div>
    ),
  }))

  return (
    <Spin spinning={loading} description={searchTerm ? "智能搜索中..." : "加载中..."}>
      {data.length === 0 && !loading ? (
        <Empty description={searchTerm ? "未找到匹配的营养缺乏" : "暂无营养缺素数据"} />
      ) : (
        <Collapse
          accordion
          className="nutrient-collapse"
          expandIcon={({ isActive }) => (
            <WarningOutlined rotate={isActive ? 90 : 0} className="text-amber-500" />
          )}
          items={collapseItems}
        />
      )}
    </Spin>
  )
}

export default NutrientDeficiency
