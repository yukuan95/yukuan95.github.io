import { create } from "zustand"
import { UpOrDown, StoreType, getNowStringTime, toFixedString, monthPlus } from './Lib.ts'
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
    month: yearMonth,
    leverage: '6',
    rate: toFixedString(rate, 4),
    rate2: toFixedString(rate2, 4),
    rateAvg: toFixedString(rateAvg, 4),
  }]
}
// export type DataType2 = {
//   time: string;
//   price: string;
//   status: string;
//   rate: string;
//   avg: string;
//   avgChg: string;
//   status2: string;
//   rate2: string;
// }
const setTable2 = (state: WritableDraft<StoreType>) => {
  const yearMonth = state.yearMonth
  if (!yearMonth) {
    return
  }
  const lastMonth = monthPlus(yearMonth, -1)
  const lastMonthLast = state.getData?.dataMap1?.get(lastMonth)?.at(-1) ?? null
  const data1 = state.getData?.dataMap1?.get(yearMonth)
  const data2 = state.getData?.dataMap2?.get(yearMonth)
  if (!(data1 && data2)) {
    return
  }
  for (let i = 0; i < data1.length; i++) {
    const item = data1[i]
    const item2 = data2[i]
    const time = item.time.slice(0, 16)

  }
}
const setTable3 = (state: WritableDraft<StoreType>) => {
  const yearMonth = state.yearMonth
}
const setTable4 = (state: WritableDraft<StoreType>) => {
  const yearMonth = state.yearMonth
}

export { useStore, useConst }