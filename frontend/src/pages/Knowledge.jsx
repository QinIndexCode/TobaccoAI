import { useState } from 'react'
import { Card, Tabs, Input, Badge, Button, Space } from 'antd'
import { SearchOutlined, BookOutlined, ThunderboltOutlined, BugOutlined, WarningOutlined } from '@ant-design/icons'
import { GrowthStages, Diseases, NutrientDeficiency } from '../components/knowledge'

const { Search } = Input

function Knowledge() {
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('growth')

  const handleSearch = (value) => {
    setSearchText(value.trim())
  } 

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const tabItems = [
    {
      key: 'growth',
      label: (
        <span className="flex items-center gap-1">
          <ThunderboltOutlined />
          生长阶段
        </span>
      ),
      children: (
        <div className="p-2">
          <GrowthStages searchTerm={searchText} />
        </div>
      ),
    },
    {
      key: 'diseases',
      label: (
        <span className="flex items-center gap-1">
          <BugOutlined />
          常见病害
        </span>
      ),
      children: (
        <div className="p-2">
          <Diseases searchTerm={searchText} />
        </div>
      ),
    },
    {
      key: 'nutrients',
      label: (
        <span className="flex items-center gap-1">
          <WarningOutlined />
          营养缺素
        </span>
      ),
      children: (
        <div className="p-2">
          <NutrientDeficiency searchTerm={searchText} />
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2">知识科普</h1>
          <p className="text-sm text-gray-500">烟草种植知识库，助您科学种植</p>
        </div>

        <Card className="mb-4 bg-linear-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center gap-3">
            <BookOutlined className="text-2xl text-green-600" />
            <div>
              <h3 className="font-medium text-green-700">烟草种植知识库</h3>
              <p className="text-xs text-green-600">包含生长阶段、病害防治、营养管理等专业知识</p>
            </div>
          </div>
        </Card>

        <Card className="mb-4">
          <Space.Compact style={{ width: '100%', display: 'flex' }}>
            <Input 
              placeholder="输入关键词搜索知识库..."
              size="large"
              value={searchText}
              onChange={handleSearchChange}
              onPressEnter={(e) => handleSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button 
              type="primary" 
              size="large"
              onClick={() => handleSearch(searchText)}
              icon={<SearchOutlined />}
              style={{ flexShrink: 0 }}
            >
              搜索
            </Button>
          </Space.Compact>
          {searchText && (
            <div className="mt-2 text-sm text-gray-500">
              搜索关键词：<Badge count={searchText} style={{ backgroundColor: '#52c41a' }} />
            </div>
          )}
        </Card>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            className="knowledge-tabs"
          />
        </Card>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">使用提示</h3>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• 在搜索框输入关键词可快速定位相关知识</li>
            <li>• 切换Tab查看不同类型的知识内容</li>
            <li>• 点击病害卡片或营养缺素项可查看详细信息</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Knowledge
