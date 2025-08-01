import { DatePicker, Button, Tooltip, Table } from 'antd'
import { FC, useEffect, useMemo } from 'react'
import { useStore, useConst } from './Store.ts'
import { useShallow } from 'zustand/react/shallow'
import { createStyles, css, cx } from 'antd-style'
import dayjs from 'dayjs'
import {
  Color, UpOrDown, ArrowSvgName, getData, genPrice, monthPlus,
  toFixedNumber, removeMilli, toFixedString, milliTimeToStringTime,
  DataType1, DataType2, DataType3, DataType4, getFonts
} from './Lib.ts'

const { Column } = Table
const { setState } = useStore

const ArrowButtonStyle = createStyles({
  arrowButton: css`
    width: 40px;
    height: 32px;
    padding: 0;
  `
})

const TimeAndPriceStyle = createStyles((_, props: {
  isError: boolean; upOrDown: UpOrDown
}) => {
  let priceColor = 'inherit'
  if (props.upOrDown === UpOrDown.up) {
    priceColor = Color.green
  }
  if (props.upOrDown === UpOrDown.down) {
    priceColor = Color.red
  }
  return {
    timeColor: css`
      color: ${props.isError ? Color.red : Color.green};
    `,
    priceColor: css`
      color: ${priceColor};
  `,
  }
})

const FontFamilyStyle = createStyles(() => {
  return {
    fontFamily: css`
      font-family: TAHOMA, Tahoma, Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    `,
  }
})

const FlexStyle = createStyles(() => {
  return {
    fsbc: css`
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    `,
    fcc: css`
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    `,
    container: css`
      width: ${useConst.width};
      padding-left: ${useConst.paddingLeft};
      padding-right: ${useConst.paddingRight};
    `,
    columnHeight: css`
      height: 30px;
    `,
  }
})

const AppStyle = createStyles((_, props: { isLight: boolean }) => {
  return {
    app: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      color: ${props.isLight ? Color.black : Color.white};
    `,
    loading: css`
      height: 100dvh;
      display: flex;
      justify-content: center;
      align-items: center;
    `,
    loader: css`
      @keyframes load8 {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border-top: 4px solid #e2e2e2;
      border-right: 4px solid #e2e2e2;
      border-bottom: 4px solid #e2e2e2;
      border-left: 4px solid #409eff;
      animation: load8 1.1s infinite linear;
    `,
  }
})

function setBodyColor(isLight: boolean) {
  document.body.style.backgroundColor = isLight ? Color.white : Color.black
}

async function init(): Promise<void> {
  const themeMedia = window.matchMedia("(prefers-color-scheme: light)")
  const isLight = themeMedia.matches
  setBodyColor(isLight)
  setState({ isLight })
  themeMedia.onchange = (e) => {
    const isLight = e.matches
    setBodyColor(isLight)
    setState({ isLight })
  }
  const getPrice = async () => {
    for await (const i of genPrice()) {
      const price = toFixedNumber(i.price, 2)
      document.title = toFixedString(i.price, 2)
      setState((state) => ({ price, priceOld: state.price }))
    }
  }
  getPrice()
  const [resData] = await Promise.all([getData(), getFonts()])
  setState((state) => ({
    getData: resData,
    price: toFixedNumber(state.price ?? resData.nowPrice, 2),
    priceOld: toFixedNumber(state.priceOld ?? resData.shortPrice, 2),
    isLoading: false,
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
  const { styles: flexStyle } = FlexStyle()
  return (<div className={flexStyle.fcc}>
    <ArrowSvg name={ArrowSvgName.rightUpArrow} />
  </div>)
}

const RightDownArrow: FC = () => {
  const { styles: flexStyle } = FlexStyle()
  return (<div className={flexStyle.fcc}>
    <ArrowSvg name={ArrowSvgName.rightDownArrow} />
  </div>)
}

const RightArrowButton: FC = () => {
  const { styles: arrowButtonStyle } = ArrowButtonStyle()
  const { styles: flexStyle } = FlexStyle()
  return (
    <Button className={arrowButtonStyle.arrowButton}>
      <div className={flexStyle.fcc}>
        <ArrowSvg name={ArrowSvgName.rightArrow} />
      </div>
    </Button>
  )
}

const LeftArrowButton: FC = () => {
  const { styles: arrowButtonStyle } = ArrowButtonStyle()
  const { styles: flexStyle } = FlexStyle()
  return (
    <Button className={arrowButtonStyle.arrowButton}>
      <div className={flexStyle.fcc}>
        <ArrowSvg name={ArrowSvgName.leftArrow} />
      </div>
    </Button>
  )
}

const TimeAndPrice: FC = () => {
  const { upOrDown, getData, price } = useStore(useShallow((state) => ({
    upOrDown: state.upOrDown, getData: state.getData, price: state.price,
  })))
  const isError = (getData?.errorLogArray?.length ?? 0) > 0
  const { styles: flexStyle } = FlexStyle()
  const { styles: timeAndPriceStyle } = TimeAndPriceStyle({ isError, upOrDown })
  const { styles: fontFamilyStyle } = FontFamilyStyle({ isError, upOrDown })
  return (
    <div style={{ userSelect: 'none' }} className={cx(flexStyle.fsbc, flexStyle.container)}>
      <Tooltip mouseEnterDelay={0} title={<div className={fontFamilyStyle.fontFamily}>{removeMilli(getData?.startTime)}</div>} >
        <div className={timeAndPriceStyle.timeColor}>{removeMilli(getData?.analyseTime)}</div>
      </Tooltip>
      <Tooltip mouseEnterDelay={0} title={<div className={fontFamilyStyle.fontFamily}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', justifyItems: 'center' }}>
          <div>shortPrice</div>
          <div style={{ whiteSpace: 'pre' }}> : </div>
          <div >{getData?.shortPrice ? toFixedString(getData?.shortPrice, 2) : ''}</div>
          <div>longPrice</div>
          <div style={{ whiteSpace: 'pre' }}> : </div>
          <div >{getData?.longPrice ? toFixedString(getData?.longPrice, 2) : ''}</div>
        </div>
      </div>}>
        <div className={flexStyle.fcc}>
          <div style={{ whiteSpace: 'pre' }}>BTC : </div>
          <div className={timeAndPriceStyle.priceColor}>{price ? toFixedString(price, 1) : ''}</div>
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
  const yearMonthValue = useMemo(() => yearMonth ? dayjs(yearMonth) : '', [yearMonth])
  return (<div className={cx(flexStyle.container, flexStyle.fsbc)}>
    <div>
      <DatePicker
        inputReadOnly={true}
        style={{ width: '220px' }}
        value={yearMonthValue}
        onChange={onChange} picker="month" />
    </div>
    <div className={cx(flexStyle.fsbc)}>
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
  const { styles: fontFamilyStyle } = FontFamilyStyle()
  return (
    <div className={flexStyle.container}>
      <Table<DataType1> dataSource={tableData1} size="small" pagination={false} bordered>
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="month" key="month" dataIndex="month" />
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="leverage" key="leverage" dataIndex="leverage" />
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="rate" key="rate" dataIndex="rate" render={(_, item) => (<>
          <Tooltip mouseEnterDelay={0} placement="left" title={<div className={fontFamilyStyle.fontFamily}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', justifyItems: 'center' }}>
              <div>rate2</div>
              <div style={{ whiteSpace: 'pre' }}> : </div>
              <div>{item.rate2}</div>
              <div>rateAvg</div>
              <div style={{ whiteSpace: 'pre' }}> : </div>
              <div>{item.rateAvg}</div>
            </div>
          </div>}>
            <div>{item.rate}</div>
          </Tooltip>
        </>)} />
      </Table>
    </div>
  )
}

const Table2: FC = () => {
  const { styles: flexStyle } = FlexStyle()
  const { styles: fontFamilyStyle } = FontFamilyStyle()
  const { tableData2, getData } = useStore(useShallow((state) => ({
    tableData2: state.tableData2, getData: state.getData
  })))
  return (
    <div className={flexStyle.container}>
      <Table<DataType2> dataSource={tableData2} size="small" pagination={false} bordered>
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title={`time(${getData?.analyseTime?.slice(24, 27) ?? ''})`} key="time" dataIndex="time" />
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="price" key="price" dataIndex="price" render={(_, item) => (<>
          <Tooltip mouseEnterDelay={0} placement="left" title={<div className={fontFamilyStyle.fontFamily}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', justifyItems: 'center' }}>
              {item.avg ? <>
                <div>avgPrice</div>
                <div style={{ whiteSpace: 'pre' }}> : </div>
                <div>{toFixedString(item.avg, 0)}</div>
              </> : ''}
              {item.avgChg ? <>
                <div>avgChg</div>
                <div style={{ whiteSpace: 'pre' }}> : </div>
                <div>{item.avgChg}</div>
              </> : ''}
              {item.maxMinChg ? <>
                <div>maxChg</div>
                <div style={{ whiteSpace: 'pre' }}> : </div>
                <div>{item.maxMinChg}</div>
              </> : ''}
              {item.status2 ? <>
                <div>status2</div>
                <div style={{ whiteSpace: 'pre' }}> : </div>
                <div>{item.status2}</div>
              </> : ''}
              {item.rate2 ? <>
                <div>rate2</div>
                <div style={{ whiteSpace: 'pre' }}> : </div>
                <div>{item.rate2}</div>
              </> : ''}
            </div>
          </div>}>
            <div>{item.price}</div>
          </Tooltip>
        </>)} />
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="status" key="status" dataIndex="status" />
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title={() => (
          <div style={{ userSelect: 'none' }} onDoubleClick={() => { setState((state) => { state.isShowAll = !state.isShowAll }) }}>rate</div>
        )} key="rate" dataIndex="rate" />
      </Table>
    </div>
  )
}

const Table3: FC = () => {
  const { styles: flexStyle } = FlexStyle()
  const { styles: fontFamilyStyle } = FontFamilyStyle()
  const { tableData3 } = useStore(useShallow((state) => ({ tableData3: state.tableData3 })))
  return (<div className={flexStyle.container}>
    <Table<DataType3> dataSource={tableData3} size="small" pagination={false} bordered>
      <Column width={100} className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="lastNMonth" key="lastNMonth" dataIndex="lastNMonth" render={(_, item) => (<>
        <div>{item.lastNMonth}</div>
      </>)} />
      <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="rate" key="rate" dataIndex="rate" />
      <Column width={100} className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="avgMonth" key="avgMonth" dataIndex="avgMonth" />
    </Table>
  </div>)
}

const Table4: FC = () => {
  const { styles: flexStyle } = FlexStyle()
  const { styles: fontFamilyStyle } = FontFamilyStyle()
  const { tableData4 } = useStore(useShallow((state) => ({ tableData4: state.tableData4 })))
  return (<div className={flexStyle.container}>
    <Table<DataType4> dataSource={tableData4} size="small" pagination={false} bordered>
      <Column width={118} className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="year" key="year" dataIndex="year" render={(_, item) => (<>
        <div>{item.year}</div>
      </>)} />
      <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="rate" key="rate" dataIndex="rate" />
      <Column width={118} className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="avgMonth" key="avgMonth" dataIndex="avgMonth" />
    </Table>
  </div>)
}

const App: FC = () => {
  const {
    isLight, price, priceOld, yearMonth, updateUpOrDown, updateShowData, isLoading, isShowAll
  } = useStore(useShallow((state) => {
    const {
      isLight, price, priceOld, yearMonth, updateUpOrDown, updateShowData, isLoading, isShowAll
    } = state
    return {
      isLight, price, priceOld, yearMonth, updateUpOrDown, updateShowData, isLoading, isShowAll
    }
  }))
  useEffect(() => { init() }, [])
  useEffect(() => { updateUpOrDown() }, [price, priceOld])
  useEffect(() => { if (!isLoading || yearMonth) { updateShowData() } }, [isLoading, yearMonth, isShowAll])
  const { styles: appStyle } = AppStyle({ isLight })
  const { styles: fontFamilyStyle } = FontFamilyStyle()
  return (
    <div className={cx(appStyle.app, fontFamilyStyle.fontFamily)}>
      {isLoading ? <div className={appStyle.loading}>
        <div className={appStyle.loader}></div>
      </div> : (<>
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
        <div style={{ height: '400px' }}></div>
      </>)
      }
    </div>
  )
}

export default App