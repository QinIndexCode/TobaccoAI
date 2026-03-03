import { Link, useLocation } from 'react-router-dom'
import { SettingOutlined } from '@ant-design/icons'

function Header() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/diagnose', label: '诊断' },
    { path: '/ai-consultation', label: 'AI 问诊' },
    { path: '/history', label: '历史' },
    { path: '/knowledge', label: '知识' },
  ]

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center gap-3"
            aria-label="烟智通首页"
          >
            <div 
              className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-md"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-base">烟</span>
            </div>
            <span className="font-bold text-xl text-primary-700">烟智通</span>
          </Link>
          
          <nav 
            className="hidden md:flex items-center gap-8"
            role="navigation"
            aria-label="主导航"
          >
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-base font-medium transition-colors min-w-[64px] h-10 ${
                    location.pathname === item.path
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  {Icon && <Icon className="text-lg" aria-hidden="true" />}
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
              aria-label="开发者配置"
              title="开发者配置"
            >
              <SettingOutlined className="text-xl" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
