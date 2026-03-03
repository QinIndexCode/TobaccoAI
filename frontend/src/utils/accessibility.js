/**
 * 无障碍工具函数
 * 用于支持屏幕阅读器和键盘导航
 */

/**
 * 向屏幕阅读器发送通知
 * @param {string} message - 要通知的消息
 * @param {'polite' | 'assertive'} priority - 通知优先级
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcer = document.getElementById('sr-announcer')
  if (announcer) {
    announcer.setAttribute('aria-live', priority)
    announcer.textContent = message
    
    // 清空消息以允许重复通知
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }
}

/**
 * 创建屏幕阅读器通知区域
 * 应在应用根组件中调用
 */
export function createAnnouncer() {
  if (typeof document === 'undefined') return null
  
  let announcer = document.getElementById('sr-announcer')
  
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = 'sr-announcer'
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    document.body.appendChild(announcer)
  }
  
  return announcer
}

/**
 * 管理焦点陷阱（用于模态框等）
 * @param {HTMLElement} container - 容器元素
 * @returns {() => void} 清理函数
 */
export function trapFocus(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  function handleTabKey(e) {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
        e.preventDefault()
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKey)
  firstElement?.focus()
  
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * 检查颜色对比度是否符合 WCAG AA 标准
 * @param {string} foreground - 前景色（十六进制）
 * @param {string} background - 背景色（十六进制）
 * @returns {{ ratio: number, passes: boolean }}
 */
export function checkContrast(foreground, background) {
  const getLuminance = (hex) => {
    const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0]
    const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= 4.5 // WCAG AA 标准
  }
}

/**
 * 跳转到主内容区域
 */
export function skipToMainContent() {
  const main = document.getElementById('main-content')
  if (main) {
    main.focus()
    main.scrollIntoView({ behavior: 'smooth' })
  }
}

/**
 * 检查是否启用了减少动画偏好
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 检查是否启用了高对比度模式
 * @returns {boolean}
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * 检查是否启用了强制颜色模式
 * @returns {boolean}
 */
export function usesForcedColors() {
  return window.matchMedia('(forced-colors: active)').matches
}

/**
 * 获取键盘可访问的按钮样式
 * @returns {Object}
 */
export function getAccessibleButtonStyle() {
  return {
    minHeight: '44px',
    minWidth: '44px',
    cursor: 'pointer',
  }
}

/**
 * 格式化日期为可读字符串（用于屏幕阅读器）
 * @param {string|Date} date - 日期
 * @returns {string}
 */
export function formatDateForScreenReader(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[d.getDay()]
  
  return `${year}年${month}月${day}日 ${weekday}`
}

/**
 * 生成唯一的无障碍 ID
 * @param {string} prefix - 前缀
 * @returns {string}
 */
export function generateA11yId(prefix = 'a11y') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}
