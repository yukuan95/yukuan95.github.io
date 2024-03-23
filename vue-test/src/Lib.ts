export enum Color {
  'black' = '#303133',
  'red' = '#f23645',
  'green' = '#089981',
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

export function getPrice(callback: (item: { time: string, price: number }) => void) {
  let wsInit = () => {
    // wss://wsaws.okx.com:8443/ws/v5/public
    let ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public')
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 'subscribe',
          args: [{
            channel: 'tickers',
            instId: 'BTC-USDT',
          }],
        })
      )
    }
    ws.onmessage = (res) => {
      let data = JSON.parse(res.data + '')
      if (data.data && data.data.length > 0 && data.data[0].last) {
        let price = Number.parseFloat(data.data[0].last + '')
        let time = getNowStringTime()
        if (!isNaN(price)) {
          callback({ time, price })
        }
      }
    }
  }
  wsInit()
}

export async function getData() {
  let url = 'https://yukuan95.github.io/data/'
  let urls = ['analyseData.json', 'errorLog.txt', 'infoLog.txt', 'priceLog.json']
  let promiseArray: any[] = []
  urls.forEach((item) => {
    promiseArray.push(fetch(url + item, { cache: "no-cache" }))
  })
  let resArray = await Promise.all(promiseArray)
  let promiseArray2: any[] = []
  promiseArray2.push(resArray[0].json())
  promiseArray2.push(resArray[1].text())
  promiseArray2.push(resArray[2].text())
  promiseArray2.push(resArray[3].json())
  let resArray2 = await Promise.all(promiseArray2)
  let resAnalyseData = resArray2[0]
  let resErrorLog: string = resArray2[1]
  let resInfoLog: string = resArray2[2]
  let resPriceLog: { nowPrice: number, shortPrice: number, longPrice: number, time: string } = resArray2[3]
  let { analyseTime, startTime, dataMap1,
    dataMap2, dataMapMonthS1, dataMapMonthS2,
    dataMapYearSMonthAvgS1, dataMapYearSMonthAvgS2,
    lastNMonthSPerSixMonth1, lastNMonthSPerSixMonth2
  } = resAnalyseData
  let resErrorLogArray: Array<{ time: string, from: string, msg: string }> = []
  resErrorLog.trim().split('\n').forEach((item) => {
    if (item.trim().length > 0) {
      resErrorLogArray.push(JSON.parse(item.trim()))
    }
  })
  let resInfoLogArray: Array<{ time: string, from: string, msg: string }> = []
  resInfoLog.trim().split('\n').forEach((item) => {
    if (item.trim().length > 0) {
      resInfoLogArray.push(JSON.parse(item.trim()))
    }
  })
  let res = {
    analyseTime,
    startTime,
    dataMap1: new Map(Object.entries(dataMap1)),
    dataMap2: new Map(Object.entries(dataMap2)),
    dataMapMonthS1: new Map(Object.entries(dataMapMonthS1)),
    dataMapMonthS2: new Map(Object.entries(dataMapMonthS2)),
    dataMapYearSMonthAvgS1: new Map(Object.entries(dataMapYearSMonthAvgS1)),
    dataMapYearSMonthAvgS2: new Map(Object.entries(dataMapYearSMonthAvgS2)),
    lastNMonthSPerSixMonth1,
    lastNMonthSPerSixMonth2,
    resErrorLogArray,
    resInfoLogArray,
    resPriceLog,
  } as {
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
    resPriceLog: { nowPrice: number, shortPrice: number, longPrice: number, time: string, }
  }
  return res
}

function toNonExponential(num: number): string {
  const m: any = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
}

export function toFixedString(f: number | string, n: number): string {
  const floatNumber = Number.parseFloat(f + '')
  if (isNaN(floatNumber)) {
    throw new Error('toFixedString number is NaN')
  }
  if (n < 0) {
    n = 0
  }
  const floatString = toNonExponential(floatNumber)
  let s = ''
  for (let i = 0; i < n; i++) {
    s += '0'
  }
  if (floatString.includes('.')) {
    s = floatString + s
  } else {
    s = floatString + '.' + s
  }
  s = s.slice(0, s.indexOf('.') + 1 + n)
  if (s.slice(s.length - 1, s.length) === '.') {
    s = s.slice(0, s.length - 1)
  }
  return s
}

export function getNowMilliTime(): number {
  return new Date().getTime()
}

export function getNowStringTime(timezone: number = 8): string {
  return milliTimeToStringTime(new Date().getTime(), timezone)
}

export function stringTimeToMilliTime(stringTime: string): number {
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