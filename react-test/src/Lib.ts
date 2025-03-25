export enum Color {
  'white' = '#FFFFFFFF',
  'black' = '#292929FF',
  'black2' = '#141414FF',
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
  dataMap1: Map<string, Array<{ time: string, price: number, priceAvg: number, priceAvgChg: number, state: Status, s: number }>>,
  dataMap2: Map<string, Array<{ time: string, price: number, priceAvg: number, priceAvgChg: number, state: Status, s: number }>>,
  dataMapMonthS1: Map<string, number>,
  dataMapMonthS2: Map<string, number>,
  dataMapMonthAvgS1: Map<string, number>,
  dataMapYearSMonthAvgS1: Map<string, { yearTotalS: number, monthAvgS: number }>,
  dataMapYearSMonthAvgS2: Map<string, { yearTotalS: number, monthAvgS: number }>,
  lastNMonthSPerSixMonth1: Array<{ lastNMonth: number, totalS: number, monthAvgS: number }>,
  lastNMonthSPerSixMonth2: Array<{ lastNMonth: number, totalS: number, monthAvgS: number }>,
  resErrorLogArray: Array<string>,
  analyseTime: string,
  startTime: string,
  nowTime: string,
  nowPrice: number,
  shortPrice: number,
  longPrice: number,
}

export type DataType1 = {
  month: string;
  leverage: string;
  rate: string;
  rate2: string;
  rateAvg: string;
}

export type DataType2 = {
  time: string;
  price: string;
  status: string;
  rate: string;
  avg: string;
  avgChg: string;
  status2: string;
  rate2: string;
}

export type DataType3 = {
  lastNMonth: string;
  rate: string;
  avgMonth: string;
  rate2: string;
}

export type DataType4 = {
  year: string;
  rate: string;
  avgMonth: string;
  rate2: string;
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

export async function getData() {
  const url = 'https://yukuan95.github.io/data/'
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
  const resErrorLog: string = resArray2[1]
  const resPriceLog: {
    nowPrice: number, shortPrice: number,
    longPrice: number, nowTime: string
  } = resArray2[2]
  const {
    analyseTime, startTime, dataMap1,
    dataMap2, dataMapMonthS1, dataMapMonthS2,
    dataMapYearSMonthAvgS1, dataMapYearSMonthAvgS2,
    lastNMonthSPerSixMonth1, lastNMonthSPerSixMonth2,
    dataMapMonthAvgS1,
  } = resAnalyseData
  const resErrorLogArray: Array<string> = []
  resErrorLog.trim().split('=====').forEach((item) => {
    if (item.trim()) {
      resErrorLogArray.push(item.trim())
    }
  })
  const res = {
    dataMap1: new Map(Object.entries(dataMap1)),
    dataMap2: new Map(Object.entries(dataMap2)),
    dataMapMonthS1: new Map(Object.entries(dataMapMonthS1)),
    dataMapMonthS2: new Map(Object.entries(dataMapMonthS2)),
    dataMapMonthAvgS1: new Map(Object.entries(dataMapMonthAvgS1)),
    dataMapYearSMonthAvgS1: new Map(Object.entries(dataMapYearSMonthAvgS1)),
    dataMapYearSMonthAvgS2: new Map(Object.entries(dataMapYearSMonthAvgS2)),
    lastNMonthSPerSixMonth1,
    lastNMonthSPerSixMonth2,
    resErrorLogArray,
    analyseTime,
    startTime,
    nowTime: resPriceLog.nowTime,
    nowPrice: resPriceLog.nowPrice,
    shortPrice: resPriceLog.shortPrice,
    longPrice: resPriceLog.longPrice,
  } as GetData
  return res
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