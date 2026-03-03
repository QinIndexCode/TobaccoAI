import { useNavigate } from 'react-router-dom'
import { Button, Steps } from 'antd'
import {
  SearchOutlined,
  BulbOutlined,
  HistoryOutlined,
  BookOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <SearchOutlined />,
      title: '智能诊断',
      description: 'AI 图像识别，95% 准确率快速诊断烟草病害',
    },
    {
      icon: <BulbOutlined />,
      title: '专家建议',
      description: '专业防治方案，科学用药指导',
    },
    {
      icon: <HistoryOutlined />,
      title: '历史记录',
      description: '完整诊断档案，追踪病害发展',
    },
    {
      icon: <BookOutlined />,
      title: '知识科普',
      description: '丰富种植知识，提升专业技能',
    },
  ]

  const steps = [
    {
      title: '拍摄上传',
      subtitle: '清晰照片更准确',
      content: '拍摄或上传烟草病害部位照片',
      icon: <CameraOutlined />,
    },
    {
      title: '环境信息',
      subtitle: '辅助诊断更精准',
      content: '填写温湿度等环境数据',
      icon: <EnvironmentOutlined />,
    },
    {
      title: '智能诊断',
      subtitle: '秒级出结果',
      content: 'AI 分析并生成诊断报告',
      icon: <FileSearchOutlined />,
    },
  ]

  return (
    <div className="home-page">
      {/* Banner 区域 */}
      <section className="banner">
        <div className="banner-content">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1>烟智通</h1>
            <p>AI 赋能烟草种植，智慧助力乡村振兴</p>
            <Button 
              type="primary"
              size="large"
              onClick={() => navigate('/diagnose')}
              className="banner-btn"
              icon={<ArrowRightOutlined />}
            >
              开始诊断
            </Button>
          </div>
        </div>
      </section>

      {/* 快速开始区域 */}
      <section className="quick-start">
        <div className="quick-start-content">
          <div className="text-center">
            <h2>遇到烟草病害问题？</h2>
            <p>AI 智能诊断，快速准确识别病害类型</p>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/diagnose')}
            className="diagnose-btn"
            icon={<CheckCircleOutlined />}
          >
            立即诊断
          </Button>
        </div>
      </section>

      {/* 核心功能区域 */}
      <section className="features">
        <div className="features-header">
          <h2>核心功能</h2>
          <p>基于深度学习的智能诊断系统，为您提供全方位的烟草病害解决方案</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使用流程区域 */}
      <section className="process">
        <div className="process-header">
          <h2>使用流程</h2>
          <p>简单三步，轻松完成病害诊断</p>
        </div>
        
        <div className="process-steps">
          <Steps
            current={-1}
            items={steps.map(step => ({
              title: step.title,
              description: (
                <div className="step-content">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-text">
                    <div className="step-subtitle">{step.subtitle}</div>
                    <div className="step-detail">{step.content}</div>
                  </div>
                </div>
              ),
            }))}
            responsive={false}
            className="custom-steps"
          />
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="cta">
        <div className="cta-content">
          <h2>开始您的智能诊断之旅</h2>
          <p>利用 AI 技术，快速准确地识别烟草病害，获取专业防治建议</p>
          <div className="cta-buttons">
            <Button
              size="large"
              onClick={() => navigate('/diagnose')}
              className="cta-btn-primary"
              icon={<CheckCircleOutlined />}
            >
              开始诊断
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/knowledge')}
              className="cta-btn-secondary"
            >
              了解更多
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
