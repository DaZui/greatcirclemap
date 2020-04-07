class 数据 {
  static 地区字典 = {}
  static 机场字典 = {}
  static 载入数据(回调函数 = () => {}) {
    axios.all([
      axios.get('data/regions.json'),
      axios.get('data/airports.json'),
      axios.get('data/airlines.json')
    ]).then(
      axios.spread(
        (regions_response, airports_response, airlines_response) => {
          数据.机场字典 = airports_response.data
          数据.地区字典 = regions_response.data
          回调函数()
        }
      )
    )
  }
}

class 机场 {
  constructor(code) {
    this.IATA = code
    this.数据 = 数据.机场字典[code]
    this.ICAO = this.数据.ICAO
    this.位置 = new 坐标点(this.数据.position)
    this.城市 = this.数据.city
    this.名称 = this.数据.name
    this.时区 = this.数据.timezone
  }
  toString() {
    return `${this.国家} ${this.城市} ${this.名称} (${this.IATA})`
  }
  get 国家() {
    const 国家 = 数据.地区字典[this.数据.country]
    if (国家['name_zh']) {
      return `${国家.flag} ${国家['name_zh']}`
    } else if (国家['name_en']) {
      return `${国家.flag} ${国家['name_en']}`
    } else {
      return `${国家.flag}`
    }
  }
  get 时差() {
    return moment().tz(this.时区).format('Z')
  }
}

class 航段 {
  constructor(from, to) {
    this.起 = new 机场(from)
    this.终 = new 机场(to)
    this.大圆线段 = new 大圆线段(this.起.位置, this.终.位置)
    this.距离 = this.大圆线段.距离
    this.航向角 = this.大圆线段.航向角
  }
}

class 航线 {
  constructor(path) {
    this.path = []
    this.total_distance = 0
    for (let i = 1; i < path.length; i++) {
      const u = new 航段(path[i - 1], path[i])
      this.path.push(u)
      this.total_distance += u.距离
    }
    if (path.length > 2) {
      this.direct_path = new 航段(path[0], path[path.length - 1], false)
      this.divert = (this.total_distance / this.direct_path.距离 - 1) * 100
    }
  }
}