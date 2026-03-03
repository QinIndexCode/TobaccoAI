import { Card, Image, Empty } from 'antd'
import { PictureOutlined } from '@ant-design/icons'

function ImageGallery({ images = [] }) {
  const validImages = images.filter(img => img)

  if (validImages.length === 0) {
    return (
      <Card 
        title={
          <span className="flex items-center gap-2">
            <PictureOutlined />
            原图展示
          </span>
        } 
        className="mb-4"
      >
        <Empty description="暂无图片" />
      </Card>
    )
  }

  const getFullUrl = (path) => {
    if (path.startsWith('http')) return path
    return `http://localhost:8000/${path}`
  }

  return (
    <Card 
      title={
        <span className="flex items-center gap-2">
          <PictureOutlined />
          原图展示
          <span className="text-sm text-gray-400 font-normal">
            ({validImages.length}张)
          </span>
        </span>
      } 
      className="mb-4"
    >
      <Image.PreviewGroup>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {validImages.map((image, index) => (
            <div 
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-primary-400 transition-colors"
            >
              <Image
                src={getFullUrl(image)}
                alt={`诊断图片 ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                placeholder={
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <PictureOutlined className="text-2xl text-gray-400" />
                  </div>
                }
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              />
            </div>
          ))}
        </div>
      </Image.PreviewGroup>
    </Card>
  )
}

export default ImageGallery
