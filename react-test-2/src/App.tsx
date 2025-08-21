import { DatePicker, Button, Tooltip, Table } from 'antd'
import { useEffect, useMemo, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'
import { subscribeKey } from 'valtio/utils'
import { cx, css } from '@emotion/css'
import { useSnapshot } from 'valtio'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
const { Column } = Table

import {
  state, getFonts, getData, toFixedNumber, genPrice, removeMilli,
  toFixedString, UpOrDown, Color, useConst, ArrowSvgName, monthPlus,
  milliTimeToStringTime, getNowStringTime, stringTimeToMilliTime
} from './Store.ts'

import type {
  DataType1, DataType2, DataType3, DataType4
} from './Store.ts'

const ArrowButtonStyle = () => {
  return {
    arrowButton: css`
      width: 40px;
      height: 32px;
      padding: 0;
    `
  }
}

const TimeAndPriceStyle = (props: { isError: boolean; upOrDown: UpOrDown }) => {
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
}

const FontFamilyStyle = () => {
  return {
    fontFamily: css`
      font-family: TAHOMA, Tahoma, Helvetica, Arial, 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    `,
  }
}

const FlexStyle = () => {
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
}

const AppStyle = (props: { isLight: boolean }) => {
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
}

const ArrowSvg = (props: { name: string }) => {
  const name = props.name
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

const RightUpArrow = () => {
  const flexStyle = FlexStyle()
  return (<div className={flexStyle.fcc}>
    <ArrowSvg name={ArrowSvgName.rightUpArrow} />
  </div>)
}

const RightDownArrow = () => {
  const flexStyle = FlexStyle()
  return (<div className={flexStyle.fcc}>
    <ArrowSvg name={ArrowSvgName.rightDownArrow} />
  </div>)
}

const RightArrowButton = () => {
  const arrowButtonStyle = ArrowButtonStyle()
  const flexStyle = FlexStyle()
  return (
    <Button className={arrowButtonStyle.arrowButton}>
      <div className={flexStyle.fcc}>
        <ArrowSvg name={ArrowSvgName.rightArrow} />
      </div>
    </Button>
  )
}

const LeftArrowButton = () => {
  const arrowButtonStyle = ArrowButtonStyle()
  const flexStyle = FlexStyle()
  return (
    <Button className={arrowButtonStyle.arrowButton}>
      <div className={flexStyle.fcc}>
        <ArrowSvg name={ArrowSvgName.leftArrow} />
      </div>
    </Button>
  )
}

const TimeAndPrice = () => {
  useSnapshot(state)
  const { price, upOrDown, getData } = state
  const nowStringTime = getNowStringTime()
  const analyseTime = getData?.analyseTime ?? nowStringTime
  const minutes = (stringTimeToMilliTime(nowStringTime) - stringTimeToMilliTime(analyseTime)) / (60 * 1000)
  const isError = ((getData?.errorLogArray?.length ?? 0) > 0) || (minutes > 70)
  const flexStyle = FlexStyle()
  const timeAndPriceStyle = TimeAndPriceStyle({ isError, upOrDown })
  const fontFamilyStyle = FontFamilyStyle()
  return (
    <div style={{ userSelect: 'none' }} className={cx(flexStyle.fsbc, flexStyle.container)}>
      <Tooltip mouseEnterDelay={0} title={<div className={cx(fontFamilyStyle.fontFamily)}>
        <div>{removeMilli(getData?.startTime)}</div>
      </div>} >
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

const MonthPicker = () => {
  useSnapshot(state)
  const flexStyle = FlexStyle()
  const { yearMonth } = state
  const getYearMonth = (data?: Date) => {
    return milliTimeToStringTime(data?.getTime() ?? new Date().getTime()).slice(0, 7)
  }
  const onChange = (e: any) => {
    const date = e?.$d ?? null
    state.yearMonth = date ? getYearMonth(date) : ''
  }
  const onClickLeft = () => {
    state.yearMonth = monthPlus(yearMonth || getYearMonth(), -1)
  }
  const onClickRight = () => {
    state.yearMonth = monthPlus(yearMonth || getYearMonth(), 1)
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

const Table1 = () => {
  useSnapshot(state)
  const { tableData1 } = state
  const flexStyle = FlexStyle()
  const fontFamilyStyle = FontFamilyStyle()
  return (
    <div className={flexStyle.container}>
      <Table<DataType1> dataSource={tableData1} size="small" pagination={false} bordered>
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="month" key="month" dataIndex="month" />
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title="leverage" key="leverage" dataIndex="leverage" />
        <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)} align="center" title={() => (
          <div style={{ userSelect: 'none' }} onDoubleClick={() => { state.isShowChart = !state.isShowChart }}>rate</div>
        )} key="rate" dataIndex="rate" render={(_, item) => (<>
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

const Table2 = () => {
  useSnapshot(state)
  const { getData, tableData2 } = state
  const flexStyle = FlexStyle()
  const fontFamilyStyle = FontFamilyStyle()
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
          <div style={{ userSelect: 'none' }} onDoubleClick={() => { state.isShowAll = !state.isShowAll }}>rate</div>
        )} key="rate" dataIndex="rate" />
      </Table>
    </div>
  )
}

const Table3 = () => {
  useSnapshot(state)
  const { tableData3 } = state
  const flexStyle = FlexStyle()
  const fontFamilyStyle = FontFamilyStyle()
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

const Table4 = () => {
  useSnapshot(state)
  const { tableData4 } = state
  const flexStyle = FlexStyle()
  const fontFamilyStyle = FontFamilyStyle()
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

const Chart = () => {
  useSnapshot(state)
  const flexStyle = FlexStyle()
  const fontFamilyStyle = FontFamilyStyle()
  const { getData, isLight } = state
  const chartClass = {
    chart: css`
      height: 200px;
      width: 342px;
      position: absolute;
      top: 32px;
    `,
    container: css`
      width: 345px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `,
    marker: css`
      display:inline-block;
      margin-right:4px;
      border-radius:10px;
      width:10px;
      height:10px;
      background-color:#5070dd;
    `
  }
  const dateValue = getData?.dateValue ?? []
  const data = dateValue.map((item) => [
    new Date(item.date.slice(0, 23) + item.date.slice(24, 27)), item.value,
  ])
  const getOption = (isLight: boolean) => {
    return {
      backgroundColor: isLight ? '#FFFFFF' : '#141414',
      grid: { left: '5', right: '5', bottom: '5', top: '10', containLabel: true },
      tooltip: {
        trigger: 'axis',
        formatter: (param: any) => {
          const date = milliTimeToStringTime(param[0].data[0].getTime()).slice(0, 16)
          const value = toFixedString(param[0].data[1], 4)
          return ReactDOMServer.renderToString(<div className={fontFamilyStyle.fontFamily}>
            <div>{date}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><span className={chartClass.marker}></span></div>
              <div style={{ fontWeight: 600, color: isLight ? 'black' : 'white' }} >{value}</div>
            </div>
          </div >)
        }
      },
      xAxis: { type: 'time', }, yAxis: { name: 'value' }, dataset: { source: data },
      series: [{ type: 'line', smooth: true, showSymbol: false, }]
    }
  }
  const setOption = (myChart: any, isLight: boolean) => {
    myChart.setTheme(isLight ? 'default' : 'dark')
    myChart.setOption(getOption(isLight))
  }
  const myChartEle = useRef(null)
  useEffect(() => {
    if (!myChartEle.current) { return }
    const myChart = echarts.init(myChartEle.current)
    setOption(myChart, isLight)
    subscribeKey(state, 'isLight', (isLight) => {
      setOption(myChart, isLight)
    })
  }, [])
  return (<div className={cx(chartClass.container)}>
    <Table dataSource={[]} size="small" pagination={false} bordered
      style={{ width: '454px' }}
      locale={{ emptyText: <div style={{ height: '202px' }}></div> }}>
      <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)}
        align="center" title={() => (<>
          <div>{removeMilli(state.getData?.dateValue?.at(-1)?.date)}</div>
        </>)} />
      <Column className={cx(flexStyle.columnHeight, fontFamilyStyle.fontFamily)}
        align="center" title={() => (<>
          <div>{toFixedString(state.getData?.dateValue?.at(-1)?.value ?? 0, 4)}</div>
        </>)} />
    </Table>
    <div className={cx(chartClass.chart)} ref={myChartEle}></div>
  </div>)
}

async function init(): Promise<void> {
  const getPrice = async () => {
    for await (const i of genPrice()) {
      document.title = toFixedString(i.price, 2)
      const price = toFixedNumber(i.price, 2)
      const priceOld = toFixedNumber(state.price ?? i.price, 2)
      state.price = price
      state.priceOld = priceOld
    }
  }
  getPrice()
  await Promise.all([getData(), getFonts()])
}

const App = () => {
  useSnapshot(state)
  const { isLight, isLoading, isShowChart } = state
  useEffect(() => { init() }, [])
  const appStyle = AppStyle({ isLight })
  const fontFamilyStyle = FontFamilyStyle()
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
        {isShowChart ? <>
          <div style={{ height: '20px' }}></div>
          <div><Chart /></div>
        </> : <></>}
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
