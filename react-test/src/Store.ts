import { create } from "zustand";
import { UpOrDown, StoreType } from './Lib.ts'
import { immer } from "zustand/middleware/immer";

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
    getData: null,
  }
  return state
}));

export { useStore, useConst }