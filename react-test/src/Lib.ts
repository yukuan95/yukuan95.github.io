export enum Color {
  'white' = '#FFFFFFFF',
  'black' = '#292929FF',
  'black2' = '#505050FF',
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

export enum ArrowSvgName {
  rightUpArrow = 'rightUpArrow',
  rightDownArrow = 'rightDownArrow',
  rightArrow = 'rightArrow',
  leftArrow = 'leftArrow',
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

export type StoreType = {
  isLoading: boolean,
  isLight: boolean,
  analyseTime: null | string,
  startTime: null | string,
  price: null | number,
  priceOld: null | number,
  upOrDown: UpOrDown,
  yearMonth: string,
  isShowAll: boolean,
  updateUpOrDown: () => void,
  updateShowData: () => void,
  getData: null | GetData,
  tableData1: Array<DataType1>,
  tableData2: Array<DataType2>,
  tableData3: Array<DataType3>,
  tableData4: Array<DataType4>,
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
  const font = new FontFace("TAHOMA", "url(https://bucket-20250628.oss-cn-shanghai.aliyuncs.com/TAHOMA.ttf)")
  document.fonts.add(font)
  font.load()
  await font.loaded
}

export async function getData() {
  const url = 'https://bucket-20250628.oss-cn-shanghai.aliyuncs.com/data/'
  const urls = ['analyseData.json', 'errorLog.txt', 'priceLog.json']
  const promiseArray: any[] = []
  urls.forEach((item) => {
    promiseArray.push(fetch(url + item, { cache: "no-cache" }))
  })
  const resArray = await Promise.all(promiseArray)
  const promiseArray2: any[] = []
  promiseArray2.push(resArray[0].json())
  promiseArray2.push(resArray[1].text())
  promiseArray2.push(resArray[2].json())
  const resArray2 = await Promise.all(promiseArray2)
  const resAnalyseData = resArray2[0]
  const resErrorLog: Array<string> = (resArray2[1] as string)
    .trim().split('=====').filter(item => !!item)
  const resPriceLog: {
    nowPrice: number, shortPrice: number,
    longPrice: number, nowTime: string
  } = resArray2[2]
  const {
    startTime, analyseTime, lever,
    orderFormMonth, orderFormYear, lastNMonth,
  } = resAnalyseData
  const errorLogArray = resErrorLog
  const {
    nowPrice, shortPrice, longPrice, nowTime
  } = resPriceLog
  return {
    startTime, analyseTime, lever,
    orderFormMonth: new Map(Object.entries(orderFormMonth)),
    orderFormYear: new Map(Object.entries(orderFormYear)),
    lastNMonth: new Map(Object.entries(lastNMonth)),
    errorLogArray, nowPrice, shortPrice, longPrice, nowTime,
  } as GetData
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

