import { create } from "zustand"
import { UpOrDown, StoreType, getNowStringTime, toFixedString, monthPlus, Status, toLowerCase } from './Lib.ts'
import { immer } from "zustand/middleware/immer"
import { WritableDraft, enableMapSet } from "immer"

enableMapSet()

const useConst = {
  width: '355px',
  paddingLeft: '5px',
  paddingRight: '5px',
}

const useStore = create<StoreType>()(immer((setState) => {
  const state: StoreType = {
    isLoading: true,
    isLight: true,
    analyseTime: null,
    startTime: null,
    price: null,
    priceOld: null,
    upOrDown: UpOrDown.none,
    yearMonth: getNowStringTime().slice(0, 7),
    isShowAll: true,
    updateUpOrDown(): void {
      setState((state) => {
        const { price, priceOld } = state
        if (price && priceOld && price > priceOld) {
          state.upOrDown = UpOrDown.up
          return
        }
        if (price && priceOld && price < priceOld) {
          state.upOrDown = UpOrDown.down
          return
        }
      })
    },
    updateShowData(): void {
      setState((state) => {
        setTable1(state)
        setTable2(state)
        setTable3(state)
        setTable4(state)
      })
    },
    getData: null,
    tableData1: [],
    tableData2: [],
    tableData3: [],
    tableData4: [],
  }
  return state
}));

const setTable1 = (state: WritableDraft<StoreType>) => {
  state.tableData1 = []
  const yearMonth = state.yearMonth
  if (!yearMonth) {
    return
  }
  const rate = state.getData?.dataMapMonthS1?.get(yearMonth)
  const rate2 = state.getData?.dataMapMonthS2?.get(yearMonth)
  const rateAvg = state.getData?.dataMapMonthAvgS1?.get(yearMonth)
  if (!(rate && rate2 && rateAvg)) {
    return
  }
  state.tableData1 = [{
    key: getNowStringTime(),
    month: yearMonth,
    leverage: '6',
    rate: toFixedString(rate, 4),
    rate2: toFixedString(rate2, 4),
    rateAvg: toFixedString(rateAvg, 4),
  }]
}

const setTable2 = (state: WritableDraft<StoreType>) => {
  state.tableData2 = []
  const yearMonth = state.yearMonth
  if (!yearMonth) {
    return
  }
  if (!state.getData?.dataMap1?.get(yearMonth)) {
    return
  }
  const lastMonth = monthPlus(yearMonth, -1)
  const lastMonthLast = state.getData?.dataMap1?.get(lastMonth)?.at(-1) ?? null
  const data1 = state.getData?.dataMap1?.get(yearMonth)
  const data2 = state.getData?.dataMap2?.get(yearMonth)
  if (!(data1 && data2)) {
    return
  }
  const table2 = []
  for (let i = 0; i < data1.length; i++) {
    const item = data1[i]
    const item2 = data2[i]
    const lastItem = i === 0 ? lastMonthLast : data1[i - 1]
    const time = item.time.slice(0, 16)
    const price = toFixedString(item.price, 1)
    const avg = toFixedString(item.priceAvg, 1)
    const avgChg = item.priceAvgChg !== 0 ? toFixedString(item.priceAvgChg * 100, 2) + "%" : ''
    const isShow = !(lastItem && item && !state.isShowAll && lastItem.state === Status.Hedge && item.state === Status.Hedge)
    const status = item.state
    const status2 = status === item2.state ? '' : item2.state
    const rate = toFixedString(item.s, 3)
    const rate2 = toFixedString(item2.s, 3) === rate ? '' : toFixedString(item2.s, 3)
    if (isShow) {
      table2.push({
        key: getNowStringTime() + i, time, price, avg, avgChg, isShow,
        status: toLowerCase(status), status2: toLowerCase(status2), rate, rate2
      })
    }
  }
  state.tableData2 = table2
}

const setTable3 = (state: WritableDraft<StoreType>) => {
  state.tableData3 = []
  const lastNMonthSPerSixMonth1 = state?.getData?.lastNMonthSPerSixMonth1
  const lastNMonthSPerSixMonth2 = state?.getData?.lastNMonthSPerSixMonth2
  if (!(lastNMonthSPerSixMonth1 && lastNMonthSPerSixMonth2)) {
    return
  }
  const table3 = []
  for (let item of lastNMonthSPerSixMonth1) {
    const item2 = lastNMonthSPerSixMonth2.find(({ lastNMonth }) => {
      return lastNMonth === item.lastNMonth
    })
    table3.push({
      key: getNowStringTime() + String(item.lastNMonth),
      lastNMonth: String(item.lastNMonth),
      rate2: String(!item2 ? 1 : toFixedString(item2.totalS, 15)),
      rate: toFixedString(item.totalS, 2),
      avgMonth: toFixedString(item.monthAvgS, 3),
    })
  }
  state.tableData3 = table3
}
const setTable4 = (state: WritableDraft<StoreType>) => {
  state.tableData4 = []
  const dataMapYearSMonthAvgS1 = state?.getData?.dataMapYearSMonthAvgS1
  const dataMapYearSMonthAvgS2 = state?.getData?.dataMapYearSMonthAvgS2
  if (!(dataMapYearSMonthAvgS1 && dataMapYearSMonthAvgS2)) {
    return
  }
  const table4 = []
  for (const [year, item] of dataMapYearSMonthAvgS1.entries()) {
    const item2 = dataMapYearSMonthAvgS2.get(year)
    table4.push({
      key: getNowStringTime() + year,
      year: year,
      rate: toFixedString(item.yearTotalS, 2),
      rate2: String(!item2 ? 1 : toFixedString(item2.yearTotalS, 15)),
      avgMonth: toFixedString(item.monthAvgS, 3),
    })
  }
  state.tableData4 = table4.reverse()
}

export { useStore, useConst }