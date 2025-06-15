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
  const rate = state.getData?.orderFormMonth?.get(yearMonth)?.perMonthS
  const rate2 = state.getData?.orderFormMonth?.get(yearMonth)?.array?.map((item) => item.preS2)?.reduce((a, b) => a * b) ?? 0
  const maxMonthN = Array.from(state.getData?.lastNMonth?.keys() ?? []).at(-1)
  const rateAvg = state.getData?.lastNMonth?.get(maxMonthN ?? '')?.avgMonth
  const leverage = String(state.getData?.lever)
  if (!(rate && rateAvg && leverage)) {
    return
  }
  state.tableData1 = [{
    key: getNowStringTime(),
    month: yearMonth,
    leverage,
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
  if (!state.getData?.orderFormMonth?.get(yearMonth)) {
    return
  }
  const lastMonth = monthPlus(yearMonth, -1)
  const lastMonthLast = state.getData?.orderFormMonth?.get(lastMonth)?.array?.at(-1) ?? null
  const data = state.getData?.orderFormMonth?.get(yearMonth)?.array
  if (!data) {
    return
  }
  const table2 = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const lastItem = i === 0 ? lastMonthLast : data[i - 1]
    const time = item.time.slice(0, 16)
    const price = toFixedString(item.nowPrice, 1)
    const avg = toFixedString(item.longPrice, 1)
    const avgChg = (item.longChg ?? 0) !== 0 ? toFixedString(item.longChg! * 100, 2) + "%" : ''
    const maxMinChg = (item.maxMinChg ?? 0) !== 0 ? toFixedString(item.maxMinChg! * 100, 2) + "%" : ''
    const isShow = !(lastItem && item && !state.isShowAll && lastItem.status === Status.Hedge && item.status === Status.Hedge)
    const status = item.status
    const status2 = status === item.status2 ? '' : item.status2
    const rate = toFixedString(item.preS, 3)
    const rate2 = toFixedString(item.preS2, 3) === rate ? '' : toFixedString(item.preS2, 3)
    if (isShow) {
      table2.push({
        key: `${time}`, time, price, avg, avgChg, maxMinChg, isShow,
        status: toLowerCase(status), status2: toLowerCase(status2), rate, rate2
      })
    }
  }
  state.tableData2 = table2
}

const setTable3 = (state: WritableDraft<StoreType>) => {
  state.tableData3 = []
  const lastNMonth = state?.getData?.lastNMonth
  if (!lastNMonth) {
    return
  }
  const table3 = []
  for (const [nMonth, item] of lastNMonth) {
    table3.push({
      key: `${nMonth}`,
      lastNMonth: String(nMonth),
      rate: toFixedString(item.lastNMonthS, 2),
      avgMonth: toFixedString(item.avgMonth, 3),
    })
  }
  state.tableData3 = table3
}

const setTable4 = (state: WritableDraft<StoreType>) => {
  state.tableData4 = []
  const orderFormYear = state?.getData?.orderFormYear
  if (!orderFormYear) {
    return
  }
  const table4 = []
  for (const [year, item] of orderFormYear) {
    table4.push({
      key: `${year}`,
      year: year,
      rate: toFixedString(item.perYearS, 2),
      avgMonth: toFixedString(item.avgMonth, 3),
    })
  }
  state.tableData4 = table4.reverse()
}

export { useStore, useConst }