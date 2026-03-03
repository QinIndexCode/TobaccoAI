import { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, Spin, App, Tag, Avatar, Empty, Modal, List, Drawer, message as AntdMessage } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined, HistoryOutlined, DeleteOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { aiConsultationApi } from '../services/ai'
import './AIConsultation.css'

const { TextArea } = Input

// 本地存储 key
const STORAGE_KEY = 'ai_consultation_current_messages'

function AIConsultation() {
  const [messages, setMessages] = useState(() => {
    // 从 localStorage 恢复聊天记录
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('加载聊天记录失败:', e)
      return []
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [history, setHistory] = useState([])
  const [selectedHistory, setSelectedHistory] = useState(null)
  const { message } = App.useApp()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 保存聊天记录到 localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.error('保存聊天记录失败:', e)
    }
  }, [messages])

  // 新建对话
  const handleNewChat = () => {
    if (messages.length > 0) {
      Modal.confirm({
        title: '确认新建对话',
        content: '当前对话将被清空，确定要开始新的对话吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          setMessages([])
          localStorage.removeItem(STORAGE_KEY)
          message.success('已新建对话')
        }
      })
    } else {
      message.info('当前没有对话记录')
    }
  }

  const loadHistory = async () => {
    try {
      const response = await aiConsultationApi.getHistory('default', 50)
      setHistory(response.data || [])
    } catch (error) {
      console.error('加载历史失败:', error)
      setHistory([])
    }
  }

  const handleSend = async () => {
    if (!input.trim()) {
      message.warning('请输入您的问题')
      return
    }

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await aiConsultationApi.consult(userInput)
      
      const aiMessage = {
        role: 'ai',
        content: response.diagnosis,
        intent: response.intent,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      await loadHistory()
    } catch (error) {
      message.error('AI 问诊失败，请稍后重试')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearHistory = async () => {
    Modal.confirm({
      title: '确认清除',
      content: '确定要清除所有问诊历史吗？此操作不可恢复。',
      okText: '确认清除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await aiConsultationApi.clearContext()
          setMessages([])
          setHistory([])
          message.success('历史记录已清除')
        } catch (error) {
          message.error('清除失败')
        }
      }
    })
  }

  const handleQuickQuestion = (question) => {
    setInput(question)
  }

  const handleLoadHistoryItem = (record) => {
    setMessages([
      {
        role: 'user',
        content: record.query,
        timestamp: record.timestamp
      },
      {
        role: 'ai',
        content: record.diagnosis,
        intent: record.intent,
        timestamp: record.timestamp
      }
    ])
    setHistoryVisible(false)
    message.success('已加载历史记录')
  }

  const handleDeleteHistoryItem = async (recordId, e) => {
    e.stopPropagation()
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条问诊记录吗？',
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await aiConsultationApi.deleteHistory(recordId)
          await loadHistory()
          message.success('记录已删除')
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const getIntentTag = (intent) => {
    const colors = {
      'symptom_description': 'blue',
      'treatment_request': 'green',
      'cause_inquiry': 'orange',
      'growth_stage': 'purple',
      'comprehensive_diagnosis': 'cyan'
    }
    
    const labels = {
      'symptom_description': '症状描述',
      'treatment_request': '防治方法',
      'cause_inquiry': '原因询问',
      'growth_stage': '生长阶段',
      'comprehensive_diagnosis': '综合诊断'
    }
    
    return (
      <Tag color={colors[intent] || 'default'} style={{ marginBottom: 8 }}>
        {labels[intent] || intent}
      </Tag>
    )
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  const renderDiagnosis = (diagnosis) => {
    if (!diagnosis) return null

    return (
      <div className="diagnosis-content">
        {diagnosis.summary && (
          <p className="diagnosis-summary">{diagnosis.summary}</p>
        )}

        {diagnosis.possible_causes && diagnosis.possible_causes.length > 0 && (
          <div className="diagnosis-section">
            <div className="section-title">🔍 可能的病因</div>
            <ul className="diagnosis-list">
              {diagnosis.possible_causes.map((cause, index) => (
                <li key={index} className="diagnosis-list-item">
                  <span className="item-label">{cause.name || cause.type}</span>
                  {cause.symptoms && <span className="item-desc"> - {cause.symptoms}</span>}
                  {cause.probability && (
                    <Tag size="small" color={cause.probability === '高' ? 'red' : 'orange'} className="probability-tag">
                      {cause.probability}概率
                    </Tag>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {diagnosis.suggestions && diagnosis.suggestions.length > 0 && (
          <div className="diagnosis-section">
            <div className="section-title">💡 建议措施</div>
            <ul className="diagnosis-list">
              {diagnosis.suggestions.map((suggestion, index) => (
                <li key={index} className="diagnosis-list-item">
                  <span className="bullet">•</span> {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {diagnosis.treatment && diagnosis.treatment.length > 0 && (
          <div className="diagnosis-section">
            <div className="section-title">💊 治疗方案</div>
            <ul className="diagnosis-list">
              {diagnosis.treatment.map((treatment, index) => (
                <li key={index} className="diagnosis-list-item">
                  <span className="bullet">•</span> {treatment}
                </li>
              ))}
            </ul>
          </div>
        )}

        {diagnosis.prevention && diagnosis.prevention.length > 0 && (
          <div className="diagnosis-section">
            <div className="section-title">🛡️ 预防措施</div>
            <ul className="diagnosis-list">
              {diagnosis.prevention.map((prevention, index) => (
                <li key={index} className="diagnosis-list-item">
                  <span className="bullet">•</span> {prevention}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const quickQuestions = [
    ' 烟草叶子发黄怎么办',
    ' 叶片黑斑是什么原因',
    ' 如何防治花叶病',
    ' 缺氮应该怎么施肥'
  ]

  return (
    <div className="ai-consultation-container">
      {/* 聊天头部 */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            <Avatar icon={<RobotOutlined />} size={40} style={{ backgroundColor: '#52c41a' }} />
          </div>
          <div className="chat-header-text">
            <h2 className="chat-title">AI 智能问诊</h2>
            <span className="chat-status">在线 · 即时响应</span>
          </div>
        </div>
        <div className="chat-header-actions">
          <Button
            icon={<PlusOutlined />}
            onClick={handleNewChat}
            size="large"
            title="新建对话"
          >
            新建对话
          </Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => setHistoryVisible(true)}
            size="large"
            title="查看历史"
          >
            历史记录
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={handleClearHistory}
            size="large"
            danger
            title="清除历史"
          >
            清除
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-icon">
              <Avatar icon={<RobotOutlined />} size={80} style={{ backgroundColor: '#52c41a' }} />
            </div>
            <h3 className="welcome-title">您好！我是烟草种植 AI 助手</h3>
            <p className="welcome-desc">请描述您遇到的问题，我会为您提供专业的诊断建议</p>
            
            <div className="welcome-divider">
              <span>💬 常见问题</span>
            </div>
            
            <div className="quick-questions">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  type="default"
                  onClick={() => handleQuickQuestion(question)}
                  className="quick-question-btn"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    <Avatar icon={<UserOutlined />} size={40} style={{ backgroundColor: '#1890ff' }} />
                  ) : (
                    <Avatar icon={<RobotOutlined />} size={40} style={{ backgroundColor: '#52c41a' }} />
                  )}
                </div>
                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    {msg.role === 'ai' && msg.intent && (
                      <div className="message-intent">
                        {getIntentTag(msg.intent)}
                      </div>
                    )}
                    <div className="message-content">
                      {msg.role === 'user' ? (
                        <p className="user-message">{msg.content}</p>
                      ) : (
                        renderDiagnosis(msg.content)
                      )}
                    </div>
                  </div>
                  <div className="message-footer">
                    <ClockCircleOutlined className="time-icon" />
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper ai">
                <div className="message-avatar">
                  <Avatar icon={<RobotOutlined />} size={40} style={{ backgroundColor: '#52c41a' }} />
                </div>
                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    <Spin description="AI 正在分析..." />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="chat-input-area">
        <div className="input-wrapper">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题，按 Enter 发送（Shift+Enter 换行）..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading}
            className="chat-input"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            size="large"
            className="send-button"
            disabled={!input.trim()}
          >
            发送
          </Button>
        </div>
      </div>

      {/* 历史抽屉 */}
      <Drawer
        title="问诊历史"
        placement="right"
        size="large"
        open={historyVisible}
        onClose={() => setHistoryVisible(false)}
        className="history-drawer"
      >
        {history.length === 0 ? (
          <Empty description="暂无问诊历史" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="history-list">
            {history.map((record) => (
              <div
                key={record.id}
                className="history-list-item"
                onClick={() => handleLoadHistoryItem(record)}
              >
                <div className="history-content">
                  <div className="history-query">
                    <UserOutlined className="query-icon" />
                    <span className="query-text">{record.query}</span>
                  </div>
                  <div className="history-meta">
                    <Tag size="small">{record.intent}</Tag>
                    <span className="history-time">{formatTime(record.timestamp)}</span>
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDeleteHistoryItem(record.id, e)}
                  className="delete-btn"
                />
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AIConsultation
