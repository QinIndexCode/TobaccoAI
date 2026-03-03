import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntdApp, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Header, Footer, BottomNav } from './components/layout'

const Home = lazy(() => import('./pages/Home'))
const Diagnose = lazy(() => import('./pages/Diagnose'))
const Result = lazy(() => import('./pages/Result'))
const History = lazy(() => import('./pages/History'))
const HistoryDetail = lazy(() => import('./pages/HistoryDetail'))
const Knowledge = lazy(() => import('./pages/Knowledge'))
const Settings = lazy(() => import('./pages/Settings'))
const AIConsultation = lazy(() => import('./pages/AIConsultation'))

const antdTheme = {
  token: {
    colorPrimary: '#16a34a',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0ea5e9',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    lineHeight: 1.6,
    lineType: 'solid',
    lineWidth: 1,
    motionUnit: 0.1,
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  components: {
    Button: {
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      borderRadius: 12,
      borderRadiusLG: 16,
      fontWeight: 500,
      primaryShadow: '0 4px 14px rgba(21, 128, 61, 0.3)',
    },
    Card: {
      borderRadiusLG: 16,
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      boxShadowTertiary: '0 8px 24px rgba(21, 128, 61, 0.12)',
      paddingLG: 24,
    },
    Input: {
      controlHeight: 44,
      controlHeightLG: 52,
      borderRadius: 10,
      paddingInline: 16,
    },
    InputNumber: {
      controlHeight: 44,
      controlHeightLG: 52,
      borderRadius: 10,
    },
    Select: {
      controlHeight: 44,
      controlHeightLG: 52,
      borderRadius: 10,
    },
    DatePicker: {
      controlHeight: 44,
      controlHeightLG: 52,
      borderRadius: 10,
    },
    Tabs: {
      cardBg: '#f8fafc',
      cardHeight: 44,
      cardPadding: '12px 20px',
      titleFontSize: 14,
      titleFontSizeLG: 16,
      inkBarColor: '#16a34a',
      itemActiveColor: '#16a34a',
      itemHoverColor: '#15803d',
      itemSelectedColor: '#16a34a',
    },
    Steps: {
      iconSize: 40,
      iconSizeSM: 32,
      titleLineHeight: 24,
      descriptionMaxWidth: 200,
    },
    Progress: {
      defaultColor: '#16a34a',
      remainingColor: '#e5e7eb',
      lineBorderRadius: 100,
      circleTextFontSize: 24,
      circleTextColor: '#16a34a',
    },
    Tag: {
      borderRadius: 8,
      borderRadiusSM: 6,
      fontSize: 12,
      fontSizeSM: 11,
    },
    Badge: {
      indicatorHeight: 18,
      indicatorHeightSM: 14,
      textFontSize: 11,
    },
    List: {
      itemPadding: '16px 20px',
      itemPaddingSM: '12px 16px',
      itemPaddingLG: '20px 24px',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f0fdf4',
      headerColor: '#166534',
      headerSplitColor: '#bbf7d0',
      rowHoverBg: '#f0fdf4',
      padding: 16,
      paddingSM: 12,
      paddingXS: 8,
    },
    Collapse: {
      headerBg: '#f8fafc',
      headerPadding: '16px 20px',
      contentBg: '#ffffff',
      contentPadding: '16px 20px',
    },
    Upload: {
      actionsCardHeight: 160,
      paddingXS: 16,
    },
    Spin: {
      dotSize: 32,
      dotSizeLG: 48,
      dotSizeSM: 20,
    },
    Message: {
      contentBg: '#ffffff',
      contentPadding: '12px 20px',
      borderRadius: 12,
    },
    Modal: {
      borderRadius: 16,
      padding: 24,
      paddingLG: 32,
    },
    Popover: {
      borderRadius: 12,
      padding: 16,
    },
    Tooltip: {
      borderRadius: 8,
      paddingSM: 8,
      paddingLG: 12,
    },
    Segmented: {
      borderRadius: 10,
      borderRadiusSM: 8,
      itemSelectedBg: '#ffffff',
      itemSelectedColor: '#16a34a',
      itemHoverBg: '#f0fdf4',
      itemHoverColor: '#15803d',
    },
    Switch: {
      height: 24,
      heightSM: 18,
      heightLG: 30,
      innerMinMargin: 4,
      innerMaxMargin: 8,
    },
    Slider: {
      controlSize: 16,
      railSize: 6,
      handleSize: 20,
      handleSizeHover: 24,
      dotSize: 10,
      railBg: '#e5e7eb',
      trackBg: '#16a34a',
      trackHoverBg: '#15803d',
      handleBg: '#ffffff',
      handleActiveColor: '#16a34a',
    },
    Checkbox: {
      borderRadius: 6,
      size: 18,
    },
    Radio: {
      borderRadius: 50,
      size: 18,
      dotSize: 10,
    },
    Avatar: {
      borderRadius: 12,
      borderRadiusLG: 16,
      borderRadiusSM: 8,
    },
    Image: {
      borderRadius: 12,
      borderRadiusLG: 16,
    },
    Skeleton: {
      borderRadius: 10,
      paragraphLiHeight: 20,
      titleHeight: 20,
    },
    Timeline: {
      dotBorderWidth: 2,
      itemPaddingBottom: 24,
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 32,
      contentFontSizeLG: 40,
      contentFontSizeSM: 24,
    },
    Descriptions: {
      titleMarginBottom: 20,
      itemPaddingBottom: 16,
      colonMarginRight: 8,
      colonMarginLeft: 2,
      contentColor: '#374151',
      labelColor: '#6b7280',
    },
    Empty: {
      imageOpacity: 0.6,
      marginXS: 8,
      marginSM: 12,
      marginMD: 16,
      marginLG: 24,
      marginXL: 32,
      marginXXL: 48,
    },
    Result: {
      iconFontSize: 72,
      titleFontSize: 24,
      subtitleFontSize: 14,
      extraMargin: 24,
    },
    Alert: {
      borderRadius: 12,
      paddingContentHorizontal: 16,
      paddingContentVertical: 12,
      withDescriptionIconSize: 24,
    },
    Notification: {
      borderRadius: 12,
      padding: 16,
      paddingLG: 20,
    },
  },
}

function App() {
  return (
    <ConfigProvider theme={antdTheme} locale={zhCN}>
      <AntdApp>
        <BrowserRouter>
          <div 
            className="min-h-screen flex flex-col" 
            style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 30%, #ffffff 100%)' }}
            role="application"
            aria-label="烟智通 - 智慧烟草种植助手"
          >
            {/* 跳过导航链接 */}
            <a href="#main-content" className="skip-link">
              跳转到主要内容
            </a>
            
            <Header />
            <main 
              id="main-content" 
              className="flex-1 pt-16 pb-20 md:pb-4"
              role="main"
              aria-label="主要内容"
              tabIndex={-1}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                  <Spin size="large" description="加载中..." />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/diagnose" element={<Diagnose />} />
                  <Route path="/result" element={<Result />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/history/:id" element={<HistoryDetail />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/ai-consultation" element={<AIConsultation />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <BottomNav />
          </div>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
