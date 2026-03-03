import { useState, useEffect } from 'react'
import { Table, Spin, App, Empty } from 'antd'
import api from '../../services/api'

const columns = [
  {
    title: '阶段',
    dataIndex: 'stage',
    key: 'stage',
    width: 80,
    fixed: 'left',
  },
  {
    title: '适宜温度',
    dataIndex: 'temp_range',
    key: 'temp_range',
    width: 100,
  },
  {
    title: '空气湿度',
    dataIndex: 'humidity_air',
    key: 'humidity_air',
    width: 100,
  },
  {
    title: '土壤湿度',
    dataIndex: 'humidity_soil',
    key: 'humidity_soil',
    width: 100,
  },
  {
    title: '关键管理',
    dataIndex: 'key_management',
    key: 'key_management',
    width: 120,
  },
]

function GrowthStages({ searchTerm = '' }) {
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
          // 从搜索结果中提取生长阶段数据 (注意：api 拦截器已经解包了 response.data)
          const searchResults = response?.data?.growth_stages || []
          setData(searchResults)
        } else {
          // 无搜索词时获取全部数据
          response = await api.get('/api/knowledge/growth-stages')
          const dataArray = Array.isArray(response) ? response : 
                           (response && Array.isArray(response.data)) ? response.data : []
          setData(dataArray)
        }
      } catch (error) {
        message.error('获取生长阶段数据失败')
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
      aria-labelledby="growth-stages-title"
      role="region"
    >
      <h3 id="growth-stages-title" className="sr-only">
        烟草生长阶段环境要求表格
      </h3>
      <Spin spinning={loading} description={searchTerm ? "智能搜索中..." : "加载中..."}>
        {data.length === 0 && !loading ? (
          <Empty description={searchTerm ? "未找到匹配的生长阶段" : "暂无生长阶段数据"} />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="stage"
            pagination={false}
            size="small"
            scroll={{ x: 500 }}
            className="growth-stages-table"
            aria-label="烟草生长阶段环境要求"
          />
        )}
      </Spin>
    </section>
  )
}

export default GrowthStages
