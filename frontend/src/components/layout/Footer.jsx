function Footer() {
  return (
    <footer 
      className="bg-gray-50 border-t border-gray-200 py-6 pb-20 md:pb-6"
      role="contentinfo"
      aria-label="页脚"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="mb-3">
            <span className="font-bold text-primary-700">烟智通</span>
            <span className="text-gray-500 text-sm ml-2">智慧烟草农业管理平台</span>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              免责声明：本平台提供的诊断结果仅供参考，不构成专业农业技术建议。
              如有疑问，请咨询当地农业技术专家。
            </p>
            <p>
              联系方式：support@yanzhitong.com | 服务热线：400-XXX-XXXX
            </p>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            © {new Date().getFullYear()} 烟智通 版权所有
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
