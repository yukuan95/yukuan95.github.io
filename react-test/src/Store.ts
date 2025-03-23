import { create } from "zustand";
import { UpOrDown, StoreType } from './Lib.ts'
import { immer } from "zustand/middleware/immer";

const useConst = {
  width: '355px',
  paddingLeft: '5px',
  paddingRight: '5px',
  upOrDownOld: UpOrDown.none
}

const useStore = create<StoreType>()(immer((_, get) => ({
  isLoading: true,
  isLight: true,
  analyseTime: null,
  startTime: null,
  price: null,
  priceOld: null,
  upOrDown(): UpOrDown {
    const price = get().price
    const priceOld = get().priceOld
    if (price && priceOld && price > priceOld) {
      useConst.upOrDownOld = UpOrDown.up
      return UpOrDown.up
    }
    if (price && priceOld && price < priceOld) {
      useConst.upOrDownOld = UpOrDown.down
      return UpOrDown.down
    }
    return useConst.upOrDownOld
  },
  getData: null,
})));

export { useStore, useConst }