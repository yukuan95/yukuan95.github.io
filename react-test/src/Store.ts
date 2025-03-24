import { create } from "zustand";
import { UpOrDown, StoreType, getNowStringTime } from './Lib.ts'
import { immer } from "zustand/middleware/immer";

const useConst = {
  width: '355px',
  paddingLeft: '5px',
  paddingRight: '5px',
}

const useStore = create<StoreType>()(immer((setState, get) => {
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
      const { yearMonth } = get()
    },
    getData: null,
  }
  return state
}));

export { useStore, useConst }