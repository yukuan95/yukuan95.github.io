import 'antd/dist/reset.css'
import '@ant-design/v5-patch-for-react-19'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App.tsx'
import locale from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import { FC } from 'react'
import 'dayjs/locale/zh-cn'
import { useStore } from './Store.ts'
import { Color } from './Lib.ts'
dayjs.locale('zh-cn')

const AppTop: FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: useStore((state) => state.isLight) ? theme.defaultAlgorithm : theme.darkAlgorithm,
        components: {
          Tooltip: {
            colorBgSpotlight: useStore((state) => state.isLight) ? Color.white : Color.black2,
            colorTextLightSolid: useStore((state) => state.isLight) ? Color.black2 : Color.white,
          },
          Table: {
            cellPaddingBlockSM: 0,
            cellPaddingInlineSM: 0,
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
