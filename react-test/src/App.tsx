import { DatePicker, Button, Tooltip, Table } from 'antd'
import { FC, useEffect } from 'react'
import { useStore, useConst } from './Store.ts'
import { useShallow } from 'zustand/react/shallow'
import { createStyles, css, cx } from 'antd-style'
import dayjs from 'dayjs'
import {
  Color, UpOrDown, ArrowSvgName, getData, genPrice, monthPlus,
  toFixedNumber, removeMilli, toFixedString, milliTimeToStringTime,
  DataType1, DataType2, DataType3, DataType4,
} from './Lib.ts'

const { Column } = Table
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
  // getPrice()
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
    height: 32px;
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
    timeColor: css`
      color: ${props.isError ? Color.red : Color.green};
    `,
    priceColor: css`
      color: ${priceColor};
  `,
  }
})

const FlexStyle = createStyles(() => {
  return {
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
    c: css`
      width: ${useConst.width};
      padding-left: ${useConst.paddingLeft};
      padding-right: ${useConst.paddingRight};
    `,
    column: css`
      height: 30px;
    `
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
  }
})

const TimeAndPrice: FC = () => {
  const { upOrDown, getData, price } = useStore(useShallow((state) => ({
    upOrDown: state.upOrDown, getData: state.getData, price: state.price,
  })))
  const isError = (getData?.resErrorLogArray?.length ?? 0) > 0
  const { styles: flexStyle } = FlexStyle()
  const { styles: tapStyle } = TimeAndPriceStyle({ isError, upOrDown: upOrDown })
  return (
    <div style={{ userSelect: 'none' }} className={cx(flexStyle.fsbc, flexStyle.c)}>
      <Tooltip title={removeMilli(getData?.startTime)} >
        <div className={tapStyle.timeColor}>{removeMilli(getData?.analyseTime)}</div>
      </Tooltip>
      <Tooltip title={<>
        <div className={flexStyle.fsbc}>
          <div style={{ whiteSpace: 'pre' }}>shortPrice : </div>
          <div>{getData?.shortPrice ? toFixedString(getData?.shortPrice, 2) : ''}</div>
        </div>
        <div className={flexStyle.fsbc}>
          <div style={{ whiteSpace: 'pre' }}>longPrice : </div>
          <div>{getData?.longPrice ? toFixedString(getData?.longPrice, 2) : ''}</div>
        </div>
      </>}>
        <div className={cx(flexStyle.fcc, flexStyle.fro)}>
          <span style={{ whiteSpace: 'pre' }}>BTC : </span>
          <span className={tapStyle.priceColor}>{price ? toFixedString(price, 1) : ''}</span>
          {upOrDown === UpOrDown.up ? <RightUpArrow /> : ''}
          {upOrDown === UpOrDown.down ? <RightDownArrow /> : ''}
        </div>
      </Tooltip>
    </div>
  )
}

const MonthPicker: FC = () => {
  const { styles: flexStyle } = FlexStyle()
  const { yearMonth } = useStore(useShallow((state) => ({
    yearMonth: state.yearMonth
  })))
  const getYearMonth = (data?: Date) => {
    return milliTimeToStringTime(data?.getTime() ?? new Date().getTime()).slice(0, 7)
  }
  const onChange = (e: any) => {
    setState((state) => {
      const date = e?.$d ?? null
      if (date) {
        state.yearMonth = getYearMonth(date)
      } else {
        state.yearMonth = ''
      }
    })
  }
  useEffect(() => {
    setState((state) => {
      if (!state.yearMonth) {
        state.yearMonth = getYearMonth()
      }
    })
  }, [yearMonth])
  const onClickLeft = () => {
    setState((state) => {
      state.yearMonth = monthPlus(yearMonth || getYearMonth(), -1)
    })
  }
  const onClickRight = () => {
    setState((state) => {
      state.yearMonth = monthPlus(yearMonth || getYearMonth(), 1)
    })
  }
  return (<div className={cx(flexStyle.fro, flexStyle.c, flexStyle.fsbc)}>
    <div>
      <DatePicker
        style={{ width: '220px' }}
        value={yearMonth ? dayjs(yearMonth) : ''}
        onChange={onChange} picker="month" />
    </div>
    <div className={cx(flexStyle.fro)}>
      <div onClick={onClickLeft}>
        <LeftArrowButton />
      </div>
      <div style={{ width: '15px' }}></div>
      <div onClick={onClickRight}>
        <RightArrowButton />
      </div>
    </div>
  </div>)
}

const Table1: FC = () => {
  const { tableData1 } = useStore(useShallow((state) => ({ tableData1: state.tableData1 })))
  const { styles: flexStyle } = FlexStyle()
  return (
    <div className={flexStyle.c}>
      <Table<DataType1> dataSource={tableData1} size="small" pagination={false} bordered>
        <Column className={flexStyle.column} align="center" title="month" dataIndex="month" />
        <Column className={flexStyle.column} align="center" title="leverage" dataIndex="leverage" />
        <Column className={flexStyle.column} align="center" title="rate" dataIndex="rate" render={(_, item) => (<>
          <Tooltip placement="left" title={<>
            <div style={{ whiteSpace: 'pre' }}>rate2 : {item.rate2}</div>
            <div style={{ whiteSpace: 'pre' }}>rateAvg : {item.rateAvg}</div>
          </>}>
            {item.rate}
          </Tooltip>
        </>)} />
      </Table>
    </div>
  )
}

const Table2: FC = () => {
  const { styles: flexStyle } = FlexStyle()
  const { tableData2, getData } = useStore(useShallow((state) => ({
    tableData2: state.tableData2, getData: state.getData
  })))
  return (
    <div className={flexStyle.c}>
      <Table<DataType2> dataSource={tableData2} size="small" pagination={false} bordered>
        <Column className={flexStyle.column} align="left" title={`time(${getData?.analyseTime?.slice(24, 27) ?? ''})`} dataIndex="time" />
        <Column className={flexStyle.column} align="center" title="price" dataIndex="price" render={(_, item) => (<>
          <Tooltip placement="left" title={<>
            {item.avg ? <div style={{ whiteSpace: 'pre' }}>avg : {item.avg}</div> : ''}
            {item.avgChg ? <div style={{ whiteSpace: 'pre' }}>avgChg : {item.avgChg}</div> : ''}
            {item.status2 ? <div style={{ whiteSpace: 'pre' }}>status2 : {item.status2}</div> : ''}
            {item.rate2 ? <div style={{ whiteSpace: 'pre' }}>rate2 : {item.rate2}</div> : ''}
          </>}>
            {item.rate}
          </Tooltip>
        </>)} />
        <Column className={flexStyle.column} align="center" title="status" dataIndex="status" />
        <Column className={flexStyle.column} align="center" title="rate" dataIndex="rate" />
      </Table>
    </div>
  )
}

const Table3: FC = () => {
  const { tableData3 } = useStore(useShallow((state) => ({ tableData3: state.tableData3 })))
  return (<></>)
}
const Table4: FC = () => {
  const { tableData4 } = useStore(useShallow((state) => ({ tableData4: state.tableData4 })))
  return (<></>)
}

const App: FC = () => {
  const {
    isLight, price, priceOld, yearMonth, updateUpOrDown, updateShowData, isLoading,
  } = useStore(useShallow((state) => {
    const {
      isLight, price, priceOld, yearMonth, updateUpOrDown, updateShowData, isLoading
    } = state
    return {
      isLight, price, priceOld, yearMonth, updateUpOrDown, updateShowData, isLoading
    }
  }))
  useEffect(() => { init() }, [])
  useEffect(() => { updateUpOrDown() }, [price, priceOld])
  useEffect(() => { if (!isLoading) { updateShowData() } }, [isLoading])
  useEffect(() => { if (yearMonth) { updateShowData() } }, [yearMonth])
  const { styles: appStyle } = AppStyle({ isLight })
  return (
    <div className={appStyle.app}>
      <div style={{ height: '20px' }}></div>
      <TimeAndPrice />
      <div style={{ height: '20px' }}></div>
      <MonthPicker />
      <div style={{ height: '20px' }}></div>
      <div><Table1 /></div>
      <div style={{ height: '20px' }}></div>
      <div><Table2 /></div>
      <div style={{ height: '20px' }}></div>
      <div><Table3 /></div>
      <div style={{ height: '20px' }}></div>
      <div><Table4 /></div>
      <div style={{ height: '20px' }}></div>
      <div>
        <Button onClick={() => {
          setState((state) => { state.isLight = !state.isLight })
        }}>
          change
        </Button>
      </div>
    </div>
  )
}

export default App