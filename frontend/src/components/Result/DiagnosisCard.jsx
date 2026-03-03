import { Card, Progress, Tag, Empty } from 'antd'
import { CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const severityConfig = {
  '低': { color: 'success', icon: <CheckCircleOutlined /> },
  '中': { color: 'warning', icon: <ExclamationCircleOutlined /> },
  '高': { color: 'error', icon: <WarningOutlined /> },
}

const typeColorMap = {
  '病害': 'red',
  '虫害': 'orange',
  '缺素': 'blue',
  '其他': 'default',
}

function DiagnosisCard({ vlResult }) {
  if (!vlResult) {
    return (
      <Card 
        title="诊断结论" 
        className="mb-4"
        role="region"
        aria-label="诊断结论"
      >
        <Empty description="暂无诊断数据" />
      </Card>
    )
  }

  const { growth_stage, leaf_health, issues, other_observations } = vlResult

  const getHealthColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getHealthStatus = (score) => {
    if (score >= 80) return '健康'
    if (score >= 60) return '一般'
    return '较差'
  }

  return (
    <Card 
      title="诊断结论" 
      className="mb-4"
      role="region"
      aria-label="诊断结论"
    >
      <div className="space-y-4">
        <div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-primary-600 text-lg">🌱</span>
            </div>
            <div>
              <div className="text-gray-500 text-sm">生长阶段</div>
              <div className="font-medium text-gray-900">{growth_stage || '未知'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-gray-500 text-sm mb-1">健康评分</div>
              <Progress
                type="circle"
                percent={leaf_health || 0}
                size={70}
                strokeColor={getHealthColor(leaf_health)}
                format={(percent) => (
                  <span style={{ color: getHealthColor(percent), fontWeight: 600 }}>
                    {percent}
                  </span>
                )}
                aria-label={`健康评分: ${leaf_health}分, 状态: ${getHealthStatus(leaf_health)}`}
              />
              <div className="text-xs text-gray-500 mt-1">{getHealthStatus(leaf_health)}</div>
            </div>
          </div>
        </div>

        {issues && issues.length > 0 && (
          <section aria-labelledby="issues-heading">
            <h4 
              id="issues-heading"
              className="font-medium text-gray-900 mb-3 flex items-center gap-2"
            >
              <WarningOutlined className="text-orange-500" aria-hidden="true" />
              发现问题 ({issues.length})
            </h4>
            <ul 
              className="space-y-3 list-none m-0 p-0"
              role="list"
              aria-label="发现的问题列表"
            >
              {issues.map((issue, index) => (
                <li
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  role="listitem"
                  aria-label={`${issue.type}: ${issue.name}, 严重程度: ${issue.severity}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Tag color={typeColorMap[issue.type] || 'default'}>
                      {issue.type}
                    </Tag>
                    <span className="font-medium text-gray-900">{issue.name}</span>
                    <Tag 
                      color={severityConfig[issue.severity]?.color || 'default'}
                      icon={severityConfig[issue.severity]?.icon}
                    >
                      严重程度: {issue.severity}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="text-gray-500">症状：</span>
                    {issue.symptoms}
                  </div>
                  <div 
                    className="flex items-center gap-2 text-xs text-gray-500"
                    aria-label={`置信度: ${Math.round(issue.confidence * 100)}%`}
                  >
                    <span>置信度：</span>
                    <Progress 
                      percent={Math.round(issue.confidence * 100)} 
                      size="small" 
                      style={{ width: 100 }}
                      strokeColor="#16a34a"
                      aria-hidden="true"
                    />
                    <span>{Math.round(issue.confidence * 100)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(!issues || issues.length === 0) && (
          <div 
            className="p-4 bg-green-50 rounded-lg text-center"
            role="status"
            aria-live="polite"
          >
            <CheckCircleOutlined className="text-2xl text-green-500 mb-2" aria-hidden="true" />
            <div className="text-green-700">未发现明显问题，烟草生长状态良好</div>
          </div>
        )}

        {other_observations && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">其他观察：</span>
              {other_observations}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default DiagnosisCard
