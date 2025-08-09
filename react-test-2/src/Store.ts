import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio'
import JSZip from 'jszip'

export const useConst = {
  width: '355px',
  paddingLeft: '5px',
  paddingRight: '5px',
}

export enum ArrowSvgName {
  rightUpArrow = 'rightUpArrow',
  rightDownArrow = 'rightDownArrow',
  rightArrow = 'rightArrow',
  leftArrow = 'leftArrow',
}

export enum Color {
  'white' = '#FFFFFFFF',
  'black' = '#292929FF',
  'gray' = '#505050FF',
  'red' = '#F23645FF',
  'green' = '#089981FF',
}

export enum UpOrDown {
  'up' = 'up',
  'down' = 'down',
  'none' = 'none',
}

export enum Status {
  Short = 'SHORT',
  Long = 'LONG',
  Hedge = 'HEDGE',
}

export type GetData = {
  analyseTime: string,
  startTime: string,
  nowTime: string,
  nowPrice: number,
  shortPrice: number,
  longPrice: number,
  lever: number,
  orderFormMonth: Map<string, {
    array: Array<{
      time: string, nowPrice: number, longPrice: number,
      status: Status, status2: Status, preS: number, preS2: number,
      maxMinChg: number | null, longChg: number | null,
    }>,
    perMonthS: number
  }>,
  orderFormYear: Map<string, { perYearS: number, avgMonth: number, }>,
  lastNMonth: Map<string, { lastNMonthS: number, avgMonth: number, }>,
  errorLogArray: Array<string>,
  dateValue: Array<{ date: string; value: number }>,
}

export type DataType1 = {
  key: React.Key;
  month: string;
  leverage: string;
  rate: string;
  rate2: string;
  rateAvg: string;
}

export type DataType2 = {
  key: React.Key;
  time: string;
  price: string;
  status: string;
  rate: string;
  avg: string;
  avgChg: string;
  maxMinChg: string;
  isShow: boolean;
  status2: string;
  rate2: string;
}

export type DataType3 = {
  key: React.Key;
  lastNMonth: string;
  rate: string;
  avgMonth: string;
}

export type DataType4 = {
  key: React.Key;
  year: string;
  rate: string;
  avgMonth: string;
}

export type StateType = {
  isLoading: boolean;
  isLight: boolean;
  analyseTime: string | null;
  startTime: string | null;
  price: number | null;
  priceOld: number | null;
  upOrDown: UpOrDown;
  yearMonth: string | null;
  isShowAll: boolean;
  getData: null | GetData,
  tableData1: Array<DataType1>;
  tableData2: Array<DataType2>;
  tableData3: Array<DataType3>;
  tableData4: Array<DataType4>;
}

export class Stream<T> {
  private array: T[] = []
  private awaitPromise: any[] = []

  push(p: T): void {
    if (this.awaitPromise.length > 0) {
      this.awaitPromise.shift()(p)
    } else {
      this.array.push(p)
    }
  }

  private async pull(): Promise<T> {
    if (this.array.length > 0) {
      return this.array.shift()!
    } else {
      return new Promise<T>((res) => {
        this.awaitPromise.push(res)
      })
    }
  }

  async *getAsyncGenerator(): AsyncGenerator<T> {
    while (true) {
      yield await this.pull()
    }
  }

  [Symbol.asyncIterator](): AsyncGenerator<T> {
    return this.getAsyncGenerator()
  }
}

export const state: StateType = proxy({
  isLoading: true,
  isLight: window.matchMedia("(prefers-color-scheme: light)").matches,
  analyseTime: null,
  startTime: null,
  price: null,
  priceOld: null,
  upOrDown: UpOrDown.none,
  yearMonth: getNowStringTime().slice(0, 7),
  isShowAll: true,
  getData: null,
  tableData1: [],
  tableData2: [],
  tableData3: [],
  tableData4: [],
})

const updateUpOrDown = () => {
  const { price, priceOld } = state
  if (price && priceOld && price > priceOld) {
    state.upOrDown = UpOrDown.up
    return
  }
  if (price && priceOld && price < priceOld) {
    state.upOrDown = UpOrDown.down
    return
  }
}

const setTable1 = () => {
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

const setTable2 = () => {
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

const setTable3 = () => {
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

const setTable4 = () => {
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

export const updateShowData = () => {
  setTable1()
  setTable2()
  setTable3()
  setTable4()
}

subscribeKey(state, 'price', () => { updateUpOrDown() })
subscribeKey(state, 'priceOld', () => { updateUpOrDown() })
subscribeKey(state, 'yearMonth', () => { updateShowData() })
subscribeKey(state, 'isShowAll', () => { updateShowData() })

export async function* genPrice(): AsyncGenerator<{ time: string, price: number }> {
  const s = new Stream<{ time: string, price: number }>()
  getPrice((item) => s.push(item))
  for await (const item of s) {
    yield item
  }
}

function getPrice(callback: (item: { time: string, price: number }) => void) {
  const wsInit = () => {
    const ws = new WebSocket('wss://dstream.binance.com/ws/btcusd_perp')
    ws.onopen = () => {
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE', params: ['btcusd_perp@markPrice'], id: 1,
      }))
    }
    ws.onmessage = (res) => {
      const data = JSON.parse(String(res.data))
      const time = getNowStringTime()
      const price = Number.parseFloat(data.p)
      if (!isNaN(price)) {
        callback({ time, price })
      }
    }
  }
  wsInit()
}

export async function getFonts(): Promise<void> {
  const font = new FontFace("TAHOMA", "url(https://bucket-20250629.oss-cn-shanghai.aliyuncs.com/TAHOMA.ttf)")
  document.fonts.add(font)
  font.load()
  await font.loaded
}

export async function getData() {
  const url = 'https://bucket-20250629.oss-cn-shanghai.aliyuncs.com/'
  const urls = ['data.zip']
  const promiseArray: any[] = []
  urls.forEach((item) => {
    promiseArray.push(fetch(url + item, { cache: "no-cache" }))
  })
  const resArray = await Promise.all(promiseArray)
  const blobFile = await resArray[0].blob()
  const zip = new JSZip()
  const loadedZip = await zip.loadAsync(blobFile)
  const files = ['data/errorLog.txt', 'data/analyseData.json', 'data/priceLog.json', 'data/dateValue.json']
  let errorLog = null
  let analyseData = null
  let priceLog = null
  let dateValue = null
  for (const filename in loadedZip.files) {
    const zipEntry = loadedZip.files[filename]
    if (filename === files[0]) {
      errorLog = await zipEntry.async('text')
    }
    if (filename === files[1]) {
      analyseData = JSON.parse(await zipEntry.async('text'))
    }
    if (filename === files[2]) {
      priceLog = JSON.parse(await zipEntry.async('text'))
    }
    if (filename === files[3]) {
      dateValue = JSON.parse(await zipEntry.async('text'))
    }
  }
  const resAnalyseData = analyseData
  const resErrorLog: Array<string> = (errorLog as string)
    .trim().split('=====').filter(item => !!item)
  const resPriceLog: {
    nowPrice: number, shortPrice: number,
    longPrice: number, nowTime: string
  } = priceLog
  const {
    startTime, analyseTime, lever,
    orderFormMonth, orderFormYear, lastNMonth,
  } = resAnalyseData
  const errorLogArray = resErrorLog
  const {
    nowPrice, shortPrice, longPrice, nowTime
  } = resPriceLog
  const resData: GetData = {
    startTime, analyseTime, lever, dateValue,
    orderFormMonth: new Map(Object.entries(orderFormMonth)),
    orderFormYear: new Map(Object.entries(orderFormYear)),
    lastNMonth: new Map(Object.entries(lastNMonth)),
    errorLogArray, nowPrice, shortPrice, longPrice, nowTime,
  }
  state.getData = resData
  state.price = toFixedNumber(state.price ?? resData.nowPrice, 2)
  state.priceOld = toFixedNumber(state.priceOld ?? resData.shortPrice, 2)
  state.analyseTime = analyseTime
  state.startTime = startTime
  updateShowData()
  state.isLoading = false
  return resData
}

export function toFixedString(f: number | string, n: number): string {
  return toNumber(f).toFixed(n)
}

export function toFixedNumber(f: number | string, n: number): number {
  return toNumber(toFixedString(f, n))
}

export function toNumber(f: number | string | undefined): number {
  const res = Number.parseFloat('' + f)
  if (isNaN(res)) {
    throw new Error('toNumber isNaN')
  } else {
    return res
  }
}

export function getNowMilliTime(): number {
  return new Date().getTime()
}

export function getNowStringTime(timezone: number = 8): string {
  return milliTimeToStringTime(new Date().getTime(), timezone)
}

export function stringTimeToMilliTime(stringTime: string): number {
  if (stringTime.length !== 27) {
    throw new Error('stringTimeToMilliTime stringTime.length !== 27')
  }
  const temp = stringTime.slice(0, 23) + stringTime.slice(24, 27)
  return new Date(temp).getTime()
}

export function timezoneToString(timezone: number): string {
  const temp = timezone >= 0 ? '+' + timezone : '-' + timezone
  return temp.length === 2 ? temp[0] + '0' + temp[1] : temp
}

export function milliTimeToStringTime(milliTime: number, timezone: number = 8): string {
  if (timezone > 12 || timezone < -12) {
    throw new Error('milliTimeToStringTime timezone error')
  }
  const temp = new Date(milliTime + timesToMilli({ hours: timezone })).toISOString()
  return `${temp.slice(0, 10)} ${temp.slice(11, 23)} ${timezoneToString(timezone)}`
}

export function timesToMilli(times: { days?: number, hours?: number, minutes?: number, seconds?: number }): number {
  const days = (times.days ?? 0) * 24 * 60 * 60 * 1000
  const hours = (times.hours ?? 0) * 60 * 60 * 1000
  const minutes = (times.minutes ?? 0) * 60 * 1000
  const seconds = (times.seconds ?? 0) * 1000
  return days + hours + minutes + seconds
}

export function monthPlus(yearMonth: string, n: number): string {
  let year = Number.parseInt(yearMonth.slice(0, 4))
  let month = Number.parseInt(yearMonth.slice(5, 7))
  month += n
  while (month > 12) {
    month -= 12
    year += 1
  }
  while (month < 1) {
    month += 12
    year -= 1
  }
  return year + '-' + (String(month).length === 1 ? `0${month}` : `${month}`)
}

export function toLowerCase(s: string) {
  return `${s.toUpperCase().slice(0, 1)}${s.toLowerCase().slice(1, s.length)}`
}

export function removeMilli(time?: string): string {
  if (!time) {
    return ''
  } else {
    return `${time.slice(0, 16)} ${time.slice(-4)}`
  }
}
