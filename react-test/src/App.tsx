import { DatePicker, Button, Popover } from 'antd'
import { FC, useEffect } from 'react'
import { useStore, useConst } from './Store.ts'
import { useShallow } from 'zustand/react/shallow'
import { createStyles, css, cx } from 'antd-style'
import {
  Color, UpOrDown, ArrowSvgName, getData, genPrice,
  toFixedNumber, removeMilli, toFixedString
} from './Lib.ts'

const { setState } = useStore

async function init(): Promise<void> {
  const themeMedia = window.matchMedia("(prefers-color-scheme: light)")
  setState({ isLight: themeMedia.matches })
  themeMedia.onchange = (e) => setState({ isLight: e.matches })
  const getPrice = async () => {
    for await (const i of genPrice()) {
      setState((state) => ({ price: toFixedNumber(i.price, 2), priceOld: state.price }))
    }
  }
  getPrice()
  const resData = await getData()
  setState((state) => ({
    getData: resData,
    price: toFixedNumber(state.price ?? resData.nowPrice, 2),
    priceOld: toFixedNumber(state.priceOld ?? resData.shortPrice, 2),
    isLoading: false
  }))
}

const ArrowSvg: FC<{ name: string }> = ({ name }) => {
  if (name === ArrowSvgName.rightUpArrow) {
    return (
      <svg style={{ color: Color.green }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        viewBox="0 0 16 16">
        <path fillRule="evenodd"
          d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z" />
      </svg>
    )
  }
  if (name === ArrowSvgName.rightDownArrow) {
    return (
      <svg style={{ color: Color.red }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
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
  return (<ArrowSvg name={ArrowSvgName.rightUpArrow} />)
}

const RightDownArrow: FC = () => {
  return (<ArrowSvg name={ArrowSvgName.rightDownArrow} />)
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

const TimeAndPriceStyle = createStyles((_, props: {
  isError: boolean; upOrDown: UpOrDown
}) => {
  const priceColor = props.upOrDown === UpOrDown.up ? Color.green :
    props.upOrDown === UpOrDown.down ? Color.red : 'inherit'
  return {
    c: css`
      width: ${useConst.width};
      padding-left: ${useConst.paddingLeft};
      padding-right: ${useConst.paddingRight};
    `,
    timeColor: css`
      color: ${props.isError ? Color.red : Color.green};
    `,
    priceColor: css`
      color: ${priceColor};
  `,
  }
})

const AppStyle = createStyles(({ token }, props: { isLight: boolean }) => {
  return {
    app: css`
      height: 100%;
      background-color: ${props.isLight ? Color.white : Color.black};
      font-family: ${token.fontFamily};
      color: ${props.isLight ? Color.black : Color.white};
    `,
    fsbc: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
    `,
    fcc: css`
      display: flex;
      justify-content: center;
      align-items: center;
    `,
    fco: css`
      display: flex;
      flex-direction: column;
    `,
    fro: css`
      display: flex;
      flex-direction: row;
    `,
  }
})

const TimeAndPrice: FC = () => {
  const { isLight, upOrDown, getData, price } = useStore(useShallow((state) => ({
    isLight: state.isLight, upOrDown: state.upOrDown,
    getData: state.getData, price: state.price,
  })))
  const isError = (getData?.resErrorLogArray?.length ?? 0) > 0
  const { styles: appStyle } = AppStyle({ isLight })
  const { styles: tapStyle } = TimeAndPriceStyle({ isError, upOrDown: upOrDown })
  return (
    <div style={{ userSelect: 'none' }} className={cx(appStyle.fsbc, tapStyle.c)}>
      <Popover content={removeMilli(getData?.startTime)} >
        <div className={tapStyle.timeColor}>{removeMilli(getData?.analyseTime)}</div>
      </Popover>
      <div className={cx(appStyle.fcc, appStyle.fro)}>
        <span style={{ whiteSpace: 'pre' }}>BTC : </span>
        <span className={tapStyle.priceColor}>{price ? toFixedString(price, 1) : ''}</span>
        {upOrDown === UpOrDown.up ? <RightUpArrow /> : ''}
        {upOrDown === UpOrDown.down ? <RightDownArrow /> : ''}
      </div>
    </div>
  )
}

const App: FC = () => {
  useEffect(() => { init() }, [])
  const { isLight, price, priceOld, updateUpOrDown } = useStore(useShallow((state) => ({
    isLight: state.isLight, price: state.price,
    priceOld: state.priceOld, updateUpOrDown: state.updateUpOrDown,
  })))
  useEffect(updateUpOrDown, [price, priceOld])
  const { styles: appStyle } = AppStyle({ isLight })
  return (
    <div className={appStyle.app}>
      <TimeAndPrice />
      <div>
        <Button onClick={() => {
          setState((state) => { state.isLight = !state.isLight })
        }}>
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


