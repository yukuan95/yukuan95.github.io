import { DatePicker, Button, Popover } from 'antd'
import { FC, useEffect } from 'react'
import { useStore, useConst } from './Store.ts'
import { createStyles, css, cx } from 'antd-style'
import {
  Color, UpOrDown, Status, ArrowSvgName, getData,
  StoreType, GetData, genPrice, getFonts, toFixedNumber
} from './Lib.ts'

async function init() {
  console.log(Math.pow(2, -50))
  const themeMedia = window.matchMedia("(prefers-color-scheme: light)")
  useStore.setState({ isLight: themeMedia.matches })
  themeMedia.onchange = (e) => useStore.setState({ isLight: e.matches })
  const getPrice = async () => {
    for await (const i of genPrice()) {
      const price = useStore.getState().price
      if (i.price && i.price !== price) {
        useStore.setState((state) => {
          return { priceOld: state.price, price: toFixedNumber(i.price, 2) }
        })
      }
    }
  }
  getPrice()
  const resData = await Promise.all([getData(), getFonts()])
  useStore.setState({ getData: resData[0], isLoading: false })
}

const ArrowSvg: FC<{ name: string }> = ({ name }) => {
  if (name === ArrowSvgName.rightUpArrow) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        viewBox="0 0 16 16">
        <path fillRule="evenodd"
          d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z" />
      </svg>
    )
  }
  if (name === ArrowSvgName.rightDownArrow) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        viewBox="0 0 16 16">
        <path fillRule="evenodd"
          d="M14 13.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1 0-1h4.793L2.146 2.854a.5.5 0 1 1 .708-.708L13 12.293V7.5a.5.5 0 0 1 1 0v6z" />
      </svg>
    )
  }
  if (name === ArrowSvgName.rightArrow) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        viewBox="0 0 16 16">
        <path
          d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z" />
      </svg>
    )
  }
  if (name === ArrowSvgName.leftArrow) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        viewBox="0 0 16 16">
        <path
          d="M10 12.796V3.204L4.519 8 10 12.796zm-.659.753-5.48-4.796a1 1 0 0 1 0-1.506l5.48-4.796A1 1 0 0 1 11 3.204v9.592a1 1 0 0 1-1.659.753z" />
      </svg>
    )
  }
  return <></>
}

const RightUpArrow: FC = () => {
  return (
    <span style={{ color: Color.green }}>
      <ArrowSvg name={ArrowSvgName.rightUpArrow} />
    </span>
  )
}

const RightDownArrow: FC = () => {
  return (
    <span style={{ color: Color.red }}>
      <ArrowSvg name={ArrowSvgName.rightDownArrow} />
    </span>
  )
}

const ArrowButtonStyle = createStyles({
  ArrowButton: css`
    width: 40px;
    height: 35px;
    padding: 0;
  `
})

const RightArrowButton: FC = () => {
  const { styles } = ArrowButtonStyle()
  return (
    <Button className={styles.ArrowButton}>
      <ArrowSvg name={ArrowSvgName.rightArrow} />
    </Button>
  )
}

const LeftArrowButton: FC = () => {
  const { styles } = ArrowButtonStyle()
  return (
    <Button className={styles.ArrowButton}>
      <ArrowSvg name={ArrowSvgName.leftArrow} />
    </Button>
  )
}

const AppStyle = createStyles((_, props: { isLight: boolean }) => {
  return {
    app: css`
      height: 100%;
      background-color: ${props.isLight ? Color.white : Color.black};
    `,
    fsbc: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
    `
  }
})

const TimeAndPriceStyle = createStyles(() => {
  return {
    c: css`
      width: ${useConst.width};
      padding-left: ${useConst.paddingLeft};
      padding-right: ${useConst.paddingRight};
    `
  }
})

const TimeAndPrice: FC = () => {
  const isLight = useStore((state) => state.isLight)
  const upOrDown = useStore((state) => state.upOrDown())
  const getData = useStore((state) => state.getData)
  const { styles: appStyle } = AppStyle({ isLight: isLight })
  const { styles: tapStyle } = TimeAndPriceStyle()
  return (
    <div className={cx(appStyle.fsbc, tapStyle.c)}>
      <Popover content={getData?.startTime} >
        <div>{getData?.analyseTime}</div>
      </Popover>
      <div>{upOrDown}</div>
      <div>{((getData?.resErrorLogArray?.length ?? 0) > 0) + ''}</div>
    </div>
  )
}

function App() {
  useEffect(() => { init() }, [])
  const { styles } = AppStyle({ isLight: useStore((state) => state.isLight) })
  return (
    <div className={styles.app}>
      <TimeAndPrice />
      <div>
        <Button onClick={() => useStore.setState((state) => ({ isLight: !state.isLight }))}>
          change
        </Button>
      </div>
      <div>
        <DatePicker picker="month" />
      </div>
      <div>
        <RightUpArrow />
      </div>
      <div>
        <RightDownArrow />
      </div>
      <div>
        <RightArrowButton />
      </div>
      <div>
        <LeftArrowButton />
      </div>
    </div>
  )
}

export default App


