import { 坐标点, 大圆线段 } from './geodesic.js'
import { getRegions, getAirports } from '../tools/data.js'

class IATANotFound {
  constructor (iata) {
    this.message = `Code ${iata} does not exist!`
  }
}

class 机场 extends 坐标点 {
  static async init (code, 范围 = null) {
    const u = await getRegions()
    const v = await getAirports()
    return new 机场(code, v, u, 范围)
  }

  constructor (code, airports = {}, regions = {}, 范围 = null) {
    if (!airports[code]) {
      throw new IATANotFound(code)
    }
    super(airports[code].position, 范围)
    this.IATA = code
    this.ICAO = airports[code].ICAO
    this.城市 = airports[code].city
    this.名称 = airports[code].name
    this.时区 = airports[code].timezone

    const 国家 = regions[airports[code].country]
    if (国家.name_zh) {
      this.国家 = `${国家.flag} ${国家.name_zh}`
    } else if (国家.name_en) {
      this.国家 = `${国家.flag} ${国家.name_en}`
    } else {
      this.国家 = `${国家.flag}`
    }
  }

  toString () {
    return `${this.城市}`
  }

  get 时差 () {
    return moment().tz(this.时区).format('Z')
  }
}

class 航线 {
  toString () {
    return this.airports.map((x) => x.IATA).join('→')
  }

  constructor (inputPaths) {
    this.airports = inputPaths
    this.paths = []
    this.total_distance = 0
    for (let i = 1; i < inputPaths.length; i++) {
      const u = new 大圆线段(this.airports[i - 1], this.airports[i])
      this.paths.push(u)
      this.total_distance += u.距离
    }
    if (inputPaths.length > 2) {
      this.direct_path = new 大圆线段(
        this.airports[0],
        this.airports[inputPaths.length - 1]
      )
      this.divert = (this.total_distance / this.direct_path.距离 - 1) * 100
    }
  }
}

export { 航线, 机场 }
