import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import { subscribeKey } from 'valtio/utils'
import '@ant-design/v5-patch-for-react-19'
import { state, Color } from './Store.ts'
import locale from 'antd/locale/zh_CN'
import { useSnapshot } from 'valtio'
import { useEffect } from 'react'
import 'antd/dist/reset.css'
import 'dayjs/locale/zh-cn'
import App from './App.tsx'
import dayjs from 'dayjs'

dayjs.locale('zh-cn')

const AppTop = () => {
  useSnapshot(state)
  useEffect(() => {
    const setIsLight = (isLight: boolean) => state.isLight = isLight
    const themeMedia = window.matchMedia("(prefers-color-scheme: light)")
    setIsLight(themeMedia.matches)
    themeMedia.onchange = ({ matches }) => setIsLight(matches)
    subscribeKey(state, 'isLight', (isLight) =>
      document.body.style.backgroundColor = isLight ? Color.white : Color.black
    )
  }, [])
  return (
    <ConfigProvider
      theme={{
        algorithm: state.isLight ? theme.defaultAlgorithm : theme.darkAlgorithm,
        components: {
          Tooltip: {
            colorBgSpotlight: state.isLight ? Color.white : Color.gray,
            colorTextLightSolid: state.isLight ? Color.gray : Color.white,
          },
          Table: {
            cellPaddingBlockSM: 0,
            headerBorderRadius: 0,
          }
        },
      }}
      locale={locale}>
      <App />
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(<AppTop />)
