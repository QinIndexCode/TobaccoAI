import { useState, useEffect } from 'react'
import { Upload, App } from 'antd'
import { InboxOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

const { Dragger } = Upload

const ImageUploader = ({ onChange, maxCount = 3 }) => {
  const [fileList, setFileList] = useState([])
  const [objectUrls, setObjectUrls] = useState([])
  const { message } = App.useApp()

  // 清理 object URL，防止内存泄漏
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [objectUrls])

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！')
      return Upload.LIST_IGNORE
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！')
      return Upload.LIST_IGNORE
    }

    if (fileList.length >= maxCount) {
      message.error(`最多只能上传 ${maxCount} 张图片！`)
      return Upload.LIST_IGNORE
    }

    return false
  }

  const handleChange = ({ fileList: newFileList }) => {
    // 为新文件创建 object URL
    const newUrls = newFileList
      .filter(file => file.originFileObj && !objectUrls.find(url => url.includes(file.uid)))
      .map(file => URL.createObjectURL(file.originFileObj))
    
    if (newUrls.length > 0) {
      setObjectUrls(prev => [...prev, ...newUrls])
    }
    
    setFileList(newFileList)
    const files = newFileList.map(item => item.originFileObj).filter(Boolean)
    onChange?.(files)
  }

  const handleRemove = (file) => {
    // 释放被删除文件的 object URL
    const urlToRevoke = objectUrls.find(url => url.includes(file.uid))
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke)
      setObjectUrls(prev => prev.filter(url => url !== urlToRevoke))
    }
    
    const newFileList = fileList.filter(item => item.uid !== file.uid)
    setFileList(newFileList)
    const files = newFileList.map(item => item.originFileObj).filter(Boolean)
    onChange?.(files)
  }

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-4">
      <PlusOutlined className="text-2xl text-primary-500 mb-2" aria-hidden="true" />
      <div className="text-sm text-gray-500">上传图片</div>
    </div>
  )

  return (
    <div 
      className="image-uploader"
      role="region"
      aria-label="图片上传区域"
    >
      <span className="sr-only" id="upload-instructions">
        上传烟草病害图片，支持 JPG、PNG 格式，单张不超过 5MB，最多 {maxCount} 张
      </span>
      
      {fileList.length === 0 ? (
        <Dragger
          multiple
          accept=".jpg,.jpeg,.png"
          beforeUpload={beforeUpload}
          onChange={handleChange}
          fileList={fileList}
          maxCount={maxCount}
          className="upload-dragger"
          aria-describedby="upload-instructions"
          aria-label="拖拽或点击上传图片"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className="text-primary-500" style={{ fontSize: '48px' }} aria-hidden="true" />
          </p>
          <p className="ant-upload-text text-base font-medium">点击或拖拽图片到此区域</p>
          <p className="ant-upload-hint text-sm text-gray-400">
            支持 JPG、PNG 格式，单张不超过 5MB，最多 {maxCount} 张
          </p>
        </Dragger>
      ) : (
        <div className="space-y-4">
          <ul 
            className="grid grid-cols-3 gap-3 list-none m-0 p-0"
            role="list"
            aria-label="已上传的图片列表"
          >
            {fileList.map((file, index) => (
              <li
                key={file.uid}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                role="listitem"
              >
                <img
                  src={objectUrls.find(url => url.includes(file.uid)) || URL.createObjectURL(file.originFileObj || file)}
                  alt={`已上传图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label={`删除图片 ${index + 1}`}
                >
                  <DeleteOutlined className="text-xs" aria-hidden="true" />
                </button>
              </li>
            ))}
            {fileList.length < maxCount && (
              <li>
                <Upload
                  accept=".jpg,.jpeg,.png"
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  fileList={fileList}
                  showUploadList={false}
                  className="aspect-square"
                  aria-label="添加更多图片"
                >
                  <div 
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="点击添加更多图片"
                  >
                    {uploadButton}
                  </div>
                </Upload>
              </li>
            )}
          </ul>
          <p 
            className="text-xs text-gray-400 text-center"
            role="status"
            aria-live="polite"
          >
            已上传 {fileList.length}/{maxCount} 张图片
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
