import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { UpOrDown, StoreType } from './Lib.ts'

const useStore = create(subscribeWithSelector((_: any, get: any) => {
  return {
    isLoading: true,
    isLight: true,
    analyseTime: null,
    startTime: null,
    price: null,
    priceOld: null,
    upOrDown: () => {
      const price = get().price
      const priceOld = get().priceOld
      if (price && priceOld) {
        if (price > priceOld) {
          return UpOrDown.up
        }
        if (price < priceOld) {
          return UpOrDown.down
        }
      }
      return UpOrDown.none
    },
    getData: null,
  } as StoreType
}));

const useConst = {
  width: '355px',
  paddingLeft: '5px',
  paddingRight: '5px',
}

export { useStore, useConst }