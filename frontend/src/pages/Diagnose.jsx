import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card, App, Spin } from 'antd'
import { LoadingOutlined, CloudUploadOutlined, ExperimentOutlined, InfoCircleOutlined, EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons'
import { ImageUploader, EnvForm } from '../components/diagnose'
import { diagnoseApi } from '../services'

function Diagnose() {
  const [form] = Form.useForm()
  const navigate = useNavigate() 
  const { message } = App.useApp()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const handleImageChange = (files) => {
    setImages(files)
  }

  const handleFetchWeather = async () => {
    try {
      setWeatherLoading(true)
      
      // 尝试获取用户地理位置，支持重试
      let latitude = null
      let longitude = null
      let getPositionError = null
      
      if ('geolocation' in navigator) {
        // 最多重试 2 次
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`第 ${attempt} 次尝试获取用户位置...`)
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000, // 15 秒超时
                maximumAge: 300000 // 5 分钟缓存
              })
            })
            latitude = position.coords.latitude
            longitude = position.coords.longitude
            console.log('获取到用户位置:', latitude, longitude)
            getPositionError = null // 成功获取，清除错误
            break // 成功则退出重试循环
          } catch (geoError) {
            console.warn(`第 ${attempt} 次获取位置失败:`, geoError)
            getPositionError = geoError
            
            // 如果是用户拒绝，则不再重试
            if (geoError.code === 1) {
              break
            }
            
            // 如果不是最后一次尝试，等待 1 秒后重试
            if (attempt < 2) {
              message.loading(`获取位置失败，${3 - attempt} 秒后重试...`, 1)
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      } else {
        getPositionError = new Error('浏览器不支持地理位置功能')
      }
      
      // 如果最终无法获取位置，显示错误提示
      if (getPositionError || latitude === null || longitude === null) {
        setWeatherLoading(false)
        message.error({
          content: '无法获取您的地理位置，请手动输入环境数据',
          description: getPositionError?.message || '请检查浏览器权限设置后重试',
          duration: 5,
        })
        return
      }
      
      // 使用获取到的位置请求天气数据
      const url = `/api/weather/current?latitude=${latitude}&longitude=${longitude}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('获取天气数据失败')
      }
      const data = await response.json()
      
      // 预填充表单数据
      const currentValues = form.getFieldsValue()
      form.setFieldsValue({
        temperature: data.temperature,
        airHumidity: data.air_humidity,
      })
      
      const locationText = data.location?.city || data.location?.name || '当前位置'
      message.success({
        content: '天气数据已填入',
        description: `数据来源：${locationText}（纬度：${latitude.toFixed(2)}°, 经度：${longitude.toFixed(2)}°）`,
        duration: 3,
      })
    } catch (error) {
      console.error('获取天气数据失败:', error)
      message.error({
        content: '获取天气数据失败',
        description: error.message || '请手动输入环境数据',
        duration: 3,
      })
    } finally {
      setWeatherLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (images.length === 0) {
        message.error('请至少上传一张图片')
        return
      }

      setLoading(true)

      const formData = new FormData()
      images.forEach((image) => {
        formData.append('images', image)
      })
      
      formData.append('date', values.date.format('YYYY-MM-DD'))
      formData.append('growth_stage', values.growthStage)
      formData.append('temperature', values.temperature)
      formData.append('air_humidity', values.airHumidity)
      formData.append('soil_humidity', values.soilHumidity)
      if (values.soilPH) {
        formData.append('soil_ph', values.soilPH)
      }
      if (values.notes) {
        formData.append('notes', values.notes)
      }

      const response = await diagnoseApi.diagnose(formData)
      
      message.success('诊断完成！')
      navigate(`/result?id=${response.diagnosis_id}`)
    } catch (error) {
      console.error('诊断失败:', error)
      if (error.errorFields) {
        message.error('请填写所有必填项')
      } else {
        message.error(error.response?.data?.message || '诊断失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="diagnose-page min-h-screen py-6 px-4" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 50%, #ffffff 100%)' }}>
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' }}>
            <ExperimentOutlined className="text-3xl" style={{ color: '#16a34a' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            烟草病害诊断
          </h1>
          <p className="text-gray-500 text-base">上传烟草图片，AI将为您智能诊断病害</p>
        </div>

        <Spin
          spinning={loading}
          description="AI思考中..."
          indicator={<LoadingOutlined style={{ fontSize: 40, color: '#16a34a' }} spin />}
          size="large"
        >
          {/* 图片上传卡片 */}
          <Card 
            className="mb-6 animate-slide-up"
            style={{ borderRadius: '20px', border: '1px solid rgba(21, 128, 61, 0.08)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
            styles={{ body: { padding: '28px' } }}
          >
            <div className="mb-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                  <CloudUploadOutlined style={{ fontSize: '20px', color: '#16a34a' }} />
                </div>
                <span>上传图片</span>
                <span className="text-red-500 text-sm">*</span>
              </h2>
              <p className="text-gray-500 text-sm mb-4 ml-13">支持 JPG/PNG 格式，最多上传 3 张图片</p>
              <ImageUploader 
                value={images} 
                onChange={handleImageChange}
                maxCount={3}
              />
            </div>
          </Card>

          {/* 环境数据卡片 */}
          <Card 
            className="mb-6 animate-slide-up"
            style={{ 
              borderRadius: '20px', 
              border: '1px solid rgba(21, 128, 61, 0.08)', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              animationDelay: '0.1s'
            }}
            styles={{ body: { padding: '28px' } }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2"/>
                    <path d="M12 20v2"/>
                    <path d="m4.93 4.93 1.41 1.41"/>
                    <path d="m17.66 17.66 1.41 1.41"/>
                    <path d="M2 12h2"/>
                    <path d="M20 12h2"/>
                    <path d="m6.34 17.66-1.41 1.41"/>
                    <path d="m19.07 4.93-1.41 1.41"/>
                  </svg>
                </div>
                <span>环境数据</span>
              </h2>
              <Button
                icon={weatherLoading ? <ReloadOutlined spin /> : <EnvironmentOutlined />}
                onClick={handleFetchWeather}
                loading={weatherLoading}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                {weatherLoading ? '获取中...' : '自动获取'}
              </Button>
            </div>
            <EnvForm form={form} />
          </Card>

          {/* 诊断按钮 */}
          <Button
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
            loading={loading}
            style={{
              height: '56px',
              fontSize: '18px',
              fontWeight: 600,
              borderRadius: '16px',
              background: loading ? undefined : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(21, 128, 61, 0.35)',
              transition: 'all 0.3s ease'
            }}
            className="animate-slide-up hover:shadow-xl"
          >
            {loading ? 'AI思考中...' : '立即AI诊断'}
          </Button>
        </Spin>

        {/* 温馨提示 */}
        <div 
          className="mt-8 p-6 animate-fade-in"
          style={{ 
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            animationDelay: '0.2s'
          }}
        >
          <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <InfoCircleOutlined style={{ color: '#2563eb' }} />
            温馨提示
          </h3>
          <ul className="text-sm text-blue-800 space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <span>请上传清晰的烟草叶片或植株照片</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
              <span>建议拍摄病斑部位，提高诊断准确率</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
              <span>环境数据越准确，诊断结果越可靠</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Diagnose
