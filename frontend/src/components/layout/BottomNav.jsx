import { Link, useLocation } from 'react-router-dom'
import { HomeOutlined, SearchOutlined, HistoryOutlined, BookOutlined, RobotOutlined } from '@ant-design/icons'

function BottomNav() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: '首页', icon: HomeOutlined },
    { path: '/diagnose', label: '诊断', icon: SearchOutlined },
    { path: '/ai-consultation', label: 'AI 问诊', icon: RobotOutlined },
    { path: '/history', label: '历史', icon: HistoryOutlined },
    { path: '/knowledge', label: '知识', icon: BookOutlined },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden"
      role="navigation"
      aria-label="底部导航"
    >
      <ul className="flex items-center justify-around h-14 list-none m-0 p-0">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex flex-col items-center justify-center h-14 px-4 transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon className="text-xl" aria-hidden="true" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
