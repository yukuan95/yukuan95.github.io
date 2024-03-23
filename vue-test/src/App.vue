<script setup lang="ts">
import * as Lib from './Lib.ts'
import { onMounted, reactive, watchEffect } from 'vue'
import { Status, Color } from './Lib.ts'
import Table from './components/Table.vue'
import TimeAndPrice from './components/TimeAndPrice.vue'
import Loading from './components/Loading.vue'
import MonthPicker from './components/MonthPicker.vue'

let width = 355
let leverage = 6
let resData = {} as {
  analyseTime: string,
  startTime: string,
  dataMap1: Map<string, Array<{ time: string, price: number, priceAvg: number, priceAvgChg: number, state: Status, s: number }>>,
  dataMap2: Map<string, Array<{ time: string, price: number, priceAvg: number, priceAvgChg: number, state: Status, s: number }>>,
  dataMapMonthS1: Map<string, number>,
  dataMapMonthS2: Map<string, number>,
  dataMapYearSMonthAvgS1: Map<string, { yearTotalS: number, monthAvgS: number }>,
  dataMapYearSMonthAvgS2: Map<string, { yearTotalS: number, monthAvgS: number }>,
  lastNMonthSPerSixMonth1: Array<{ lastNMonth: number, totalS: number, monthAvgS: number }>,
  lastNMonthSPerSixMonth2: Array<{ lastNMonth: number, totalS: number, monthAvgS: number }>,
  resErrorLogArray: Array<{ time: string, from: string, msg: string }>,
  resInfoLogArray: Array<{ time: string, from: string, msg: string }>,
  resPriceLog: { nowPrice: number, shortPrice: number, longPrice: number, time: string },
}

let state = reactive({
  isLoading: true,
  isShowAll: true,
  currentMonth: Lib.getNowStringTime().slice(0, 7),
  priceArray: [] as Array<{ time: string, price: number }>,
  priceColor: Color.black,
  time: '',
  timeColor: Color.black,
  resErrorLogArray: [] as Array<{ time: string, from: string, msg: string }>,
  resInfoLogArray: [] as Array<{ time: string, from: string, msg: string }>,
} as {
  isLoading: boolean
  isShowAll: boolean
  currentMonth: string
  priceArray: Array<{ time: string, price: number }>
  priceColor: Color
  time: string
  timeColor: Color
  resErrorLogArray: Array<{ time: string, from: string, msg: string }>
  resInfoLogArray: Array<{ time: string, from: string, msg: string }>
  resPriceLog: { nowPrice: number, shortPrice: number, longPrice: number, time: string },
  table1: any
  table2: any
  table3: any
  table4: any
})

onMounted(async () => {
  await getData()
  setTable1()
  setTable2()
  setTable3()
  setTable4()
})

watchEffect(async () => {
  ;[state.currentMonth, state.isShowAll];
  if (Object.keys(resData).length === 0) {
    return
  }
  setTable1()
  setTable2()
})

watchEffect(() => {
  if (state.priceArray.length >= 2) {
    let price1 = state.priceArray.at(-1)!!.price
    let price2 = state.priceArray.at(-2)!!.price
    if (price1 > price2) {
      state.priceColor = Color.green
    }
    if (price1 < price2) {
      state.priceColor = Color.red
    }
  }
})

function setTable1() {
  let data = resData.dataMapMonthS1.get(state.currentMonth)
  let data2 = resData.dataMapMonthS2.get(state.currentMonth)
  let fields1 = [
    { key: 'month', label: 'month', align: 'center' },
    { key: 'leverage', label: 'leverage', align: 'center' },
    { key: 'rate', label: 'rate', align: 'center' },
  ]
  let items1 = [
    {
      month: { value: state.currentMonth },
      leverage: { value: leverage },
      rate: {
        value: Lib.toFixedString(data ? data : 1, 3),
        popover: { rate2: Lib.toFixedString(data2 ? data2 : 1, 3) },
        placement: 'left',
      },
    },
  ]
  let table1 = { width, border: true, fields: fields1, items: items1 }
  state.table1 = table1
}

function setTable2() {
  let fields2 = [
    { key: 'time', label: `time(${resData.analyseTime.slice(24, 27)})`, width: 140 },
    { key: 'price', label: 'price', align: 'center', width: 80 },
    { key: 'status', label: 'status', align: 'center', width: 70 },
    {
      key: 'rate', label: 'rate', align: 'center', width: 65, dblclick: () => {
        state.isShowAll = !state.isShowAll
      },
    },
  ]
  let items2: any[] = []
  let lastMonth = Lib.monthPlus(state.currentMonth, -1)
  let lastMonthLast = resData.dataMap1.get(lastMonth)?.at(-1)
  if (resData.dataMap1.get(state.currentMonth) && resData.dataMap2.get(state.currentMonth)) {
    for (let i = 0; i < resData.dataMap1.get(state.currentMonth)!!.length; i++) {
      let item = resData.dataMap1.get(state.currentMonth)!![i]
      let item2 = resData.dataMap2.get(state.currentMonth)!![i]
      let _item = i === 0 ? (lastMonthLast) : (resData.dataMap1.get(state.currentMonth)!![i - 1])
      let time = { value: item.time.slice(0, 16) }
      let price: any = {
        value: Lib.toFixedString(item.price, 1),
        placement: 'left',
        popover: {
          avg: Lib.toFixedString(item.priceAvg, 1),
        },
      }
      if (item.priceAvgChg !== 0) {
        price.popover.avgChg = Lib.toFixedString(item.priceAvgChg * 100, 2) + "%"
      }
      let isShow = true
      if (_item && !state.isShowAll && _item.state === Status.Hedge && item.state === Status.Hedge) {
        isShow = false
      }
      let status = item.state
      let status2 = item2.state
      let rate = Lib.toFixedString(item.s, 3)
      let rate2 = Lib.toFixedString(item2.s, 3)
      if (status !== status2) {
        price.popover.status2 = status2
      }
      if (rate !== rate2) {
        price.popover.rate2 = rate2
      }
      if (isShow) {
        items2.push({
          time, price, status: { value: status }, rate: { value: rate }
        })
      }
    }
    for (let i = items2.length - 1; i >= 0; i--) {
      if (items2[i].status.value === Status.Hedge && state.currentMonth === Lib.getNowStringTime().slice(0, 7)) {
        items2[i].time.popover = { value: resData.startTime.slice(0, 16) }
        items2[i].time.placement = 'top'
      }
      items2[i].status.value = Lib.toLowerCase(items2[i].status.value)
      if (items2[i].price?.popover?.status2) {
        items2[i].price.popover.status2 = Lib.toLowerCase(items2[i].price?.popover?.status2)
      }
    }
  }
  let table2 = { width, border: false, fields: fields2, items: items2 }
  state.table2 = table2
}

function setTable3() {
  let fields3 = [
    { key: 'lastNMonth', label: 'lastNMonth', align: 'center', width: 107 },
    { key: 'rate', label: 'rate', align: 'center' },
    { key: 'avgMonth', label: 'avgMonth', align: 'center', width: 96 },
  ]
  let items3: any[] = []
  for (let item of resData.lastNMonthSPerSixMonth1) {
    let item2 = resData.lastNMonthSPerSixMonth2.find(({ lastNMonth }) => {
      return lastNMonth === item.lastNMonth
    })
    items3.push({
      lastNMonth: {
        value: item.lastNMonth,
        placement: 'right',
        popover: { rate2: !item2 ? 1 : Lib.toFixedString(item2.totalS, 15) },
      },
      rate: { value: Lib.toFixedString(item.totalS, 1) },
      avgMonth: { value: Lib.toFixedString(item.monthAvgS, 3) },
    })
  }
  state.table3 = { width, border: true, fields: fields3, items: items3 }
}

function setTable4() {
  let fields4 = [
    { key: 'year', label: 'year', align: 'center' },
    { key: 'rate', label: 'rate', align: 'center' },
    { key: 'avgMonth', label: 'avgMonth', align: 'center' },
  ]
  let items4: any[] = []
  for (let [year, item] of resData.dataMapYearSMonthAvgS1.entries()) {
    let item2 = resData.dataMapYearSMonthAvgS2.get(year)
    items4.push({
      year: {
        value: year,
        placement: 'right',
        popover: { rate2: !item2 ? 1 : Lib.toFixedString(item2.yearTotalS, 15) },
      },
      rate: { value: Lib.toFixedString(item.yearTotalS, 2) },
      avgMonth: { value: Lib.toFixedString(item.monthAvgS, 3) },
    })
  }
  state.table4 = { width, border: true, fields: fields4, items: items4.reverse() }
}

async function getData() {
  Lib.getPrice(getPrice)
  resData = await Lib.getData()
  state.time = resData.analyseTime
  state.timeColor = resData.resErrorLogArray.length > 0 ? Color.red : Color.green
  let timeMin = Lib.getNowMilliTime() - Lib.stringTimeToMilliTime(resData.analyseTime)
  if (timeMin > 66 * 60 * 1000) {
    state.timeColor = Color.red
  }
  state.resErrorLogArray = resData.resErrorLogArray
  state.resInfoLogArray = resData.resInfoLogArray
  state.resPriceLog = resData.resPriceLog
  state.priceArray = []
  Array.from(resData.dataMap1.values()).at(-1)?.forEach((item) => {
    state.priceArray.push({ time: item.time, price: item.price })
  })
  if (state.resPriceLog?.shortPrice && state.resPriceLog?.time) {
    state.priceArray.push({ time: state.resPriceLog?.time, price: state.resPriceLog?.shortPrice })
  }
  state.isLoading = false
}

function getPrice(item: { time: string, price: number }) {
  if (state.priceArray.length === 0) {
    return
  }
  if (item.price === state.priceArray.at(-1)?.price) {
    state.priceArray.at(-1)!!.time = item.time
  } else {
    state.priceArray.push(item)
  }
  while (state.priceArray.length > 2) {
    state.priceArray.shift()
  }
}

</script>

<template>
  <div class="font" :style="{ 'min-width': width + 'px' }">
    <div v-if="state.isLoading" class="fc jcc aic" style="height: 100dvh;">
      <Loading></Loading>
    </div>
    <div v-else class="fc jcc aic">
      <div :style="{ 'width': width + 'px', 'height': '20px' }"></div>
      <TimeAndPrice :width="width" paddingLeft="5" paddingRight="5"
        :time="state.time ? `${state.time.slice(0, 16)} ${state.time.slice(-4)}` : ''" :timeColor="state.timeColor"
        :price="state.priceArray.at(-1) ? state.priceArray.at(-1)?.price : ''" :priceColor="state.priceColor">
      </TimeAndPrice>
      <div :style="{ 'width': width + 'px', 'height': '20px' }"></div>
      <MonthPicker @month-change="month => state.currentMonth = month" :width="width" paddingLeft="5" paddingRight="5">
      </MonthPicker>
      <div :style="{ 'width': width + 'px', 'height': '20px' }"></div>
      <Table v-if="state.table1" v-bind="state.table1"></Table>
      <div :style="{ 'width': width + 'px', 'height': '20px' }"></div>
      <Table v-if="state.table2" v-bind="state.table2"></Table>
      <div :style="{ 'width': width + 'px', 'height': '20px' }"></div>
      <Table v-if="state.table3" v-bind="state.table3"></Table>
      <div :style="{ 'width': width + 'px', 'height': '20px' }"></div>
      <Table v-if="state.table4" v-bind="state.table4"></Table>
      <div :style="{ 'width': width + 'px', 'height': '500px' }"></div>
    </div>
  </div>
</template>

<style scoped>
.font {
  font-family: Tahoma, Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
</style>
