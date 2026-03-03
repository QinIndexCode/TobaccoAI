import { Card, Collapse, Empty, Tag } from 'antd'
import { 
  CloudOutlined, 
  ThunderboltOutlined, 
  BugOutlined, 
  ToolOutlined 
} from '@ant-design/icons'

const panelIcons = {
  irrigation: <CloudOutlined className="text-blue-500" />,
  fertilizer: <ThunderboltOutlined className="text-yellow-500" />,
  pest_control: <BugOutlined className="text-red-500" />,
  other_management: <ToolOutlined className="text-gray-500" />,
}

const panelTitles = {
  irrigation: '灌溉方案',
  fertilizer: '施肥方案',
  pest_control: '病虫害防控',
  other_management: '其他管理',
}

function SuggestionSection({ llmSuggestion }) {
  if (!llmSuggestion) {
    return (
      <Card title="管理建议" className="mb-4">
        <Empty description="暂无建议数据" />
      </Card>
    )
  }

  const suggestions = [
    { key: 'irrigation', content: llmSuggestion.irrigation },
    { key: 'fertilizer', content: llmSuggestion.fertilizer },
    { key: 'pest_control', content: llmSuggestion.pest_control },
    { key: 'other_management', content: llmSuggestion.other_management },
  ].filter(item => item.content)

  if (suggestions.length === 0) {
    return (
      <Card title="管理建议" className="mb-4">
        <Empty description="暂无建议数据" />
      </Card>
    )
  }

  const panelItems = suggestions.map((item, index) => ({
    key: String(index),
    label: (
      <div className="flex items-center gap-2">
        {panelIcons[item.key]}
        <span className="font-medium">{panelTitles[item.key]}</span>
      </div>
    ),
    children: (
      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {item.content}
      </div>
    ),
  }))

  return (
    <Card title="管理建议" className="mb-4">
      <Collapse
        defaultActiveKey={['0', '1', '2', '3']}
        items={panelItems}
        className="bg-transparent"
        bordered={false}
      />
    </Card>
  )
}

export default SuggestionSection
