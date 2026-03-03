import React, { useState, useEffect } from 'react'

/**
 * 自定义数字输入框 + 单位组件
 * - 整体圆角边框，左右两部分无缝融合
 * - 鼠标悬停在输入框区域时显示上下箭头（自定义 SVG）
 * - 点击箭头可增减数值（支持 min/max/step 限制）
 * - 支持键盘输入，浏览器默认 spinner 已隐藏
 */
const NumberInput = ({
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  placeholder = '',
  disabled = false,
  precision = 0,
  className = '',
  validationStatus = '', // 'error' | 'warning' | 'success' | ''
  'aria-label': ariaLabel,
}) => {
  const [hovered, setHovered] = useState(false)
  const [inputValue, setInputValue] = useState(value ?? '')

  // 同步外部 value 变化
  useEffect(() => {
    setInputValue(value ?? '')
  }, [value])

  // 获取验证状态对应的样式类
  const getStatusClass = () => {
    if (!validationStatus) return ''
    return `number-input-${validationStatus}`
  }

  const handleIncrement = (e) => {
    e.preventDefault()
    if (disabled) return
    const current = parseFloat(inputValue) || 0
    let newVal = current + step
    if (max !== undefined) newVal = Math.min(newVal, max)
    if (precision > 0) {
      newVal = parseFloat(newVal.toFixed(precision))
    }
    const newValue = newVal.toString()
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleDecrement = (e) => {
    e.preventDefault()
    if (disabled) return
    const current = parseFloat(inputValue) || 0
    let newVal = current - step
    if (min !== undefined) newVal = Math.max(newVal, min)
    if (precision > 0) {
      newVal = parseFloat(newVal.toFixed(precision))
    }
    const newValue = newVal.toString()
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    // 允许空字符串（清空）
    if (val === '') {
      setInputValue('')
      onChange?.('')
      return
    }
    // 只允许数字和小数点
    if (/^-?\d*\.?\d*$/.test(val)) {
      setInputValue(val)
      onChange?.(val)
    }
  }

  return (
    <div
      className={`number-input-wrapper ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="input-container">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          className={`number-input ${getStatusClass()}`}
        />
        {/* 自定义上下箭头 - 仅在 hover 时显示 */}
        {!disabled && (
          <div className={`arrow-buttons ${hovered ? 'visible' : ''}`}>
            {/* 上箭头 */}
            <button
              type="button"
              onClick={handleIncrement}
              className="arrow-btn up"
              aria-label="增加"
              tabIndex={-1}
            >
              <svg
                className="arrow-icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M946.2 534.1L550.3 138.2 153.2 535.4c-7.8 7.8-20.5 7.8-28.3 0-7.8-7.8-7.8-20.5 0-28.3L534 97.9c9-9 23.6-9 32.6 0l407.9 407.9c7.8 7.8 7.8 20.5 0 28.3-7.8 7.8-20.4 7.8-28.3 0z"
                />
              </svg>
            </button>
            {/* 下箭头 */}
            <button
              type="button"
              onClick={handleDecrement}
              className="arrow-btn down"
              aria-label="减少"
              tabIndex={-1}
            >
              <svg
                className="arrow-icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M153.2 507.1L549.1 903l397.2-397.2c7.8-7.8 20.5-7.8 28.3 0 7.8 7.8 7.8 20.5 0 28.3L565.4 943.2c-9 9-23.6 9-32.6 0L124.9 535.4c-7.8-7.8-7.8-20.5 0-28.3 7.8 7.8 20.5 7.8 28.3 0z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      {unit && (
        <div className="unit-label">
          {unit}
        </div>
      )}
    </div>
  )
}

export default NumberInput
