class 数据 {
  static 地区字典 = {};
  static 机场字典 = {};
  static 载入数据(回调函数 = () => {}) {
    axios
      .all([
        axios.get("https://cdn.jsdelivr.net/gh/liandlillc/airports_zh@master/regions.json"),
        axios.get("https://cdn.jsdelivr.net/gh/liandlillc/airports_zh@master/airports.json"),
      ])
      .then(
        axios.spread((regions_response, airports_response) => {
          数据.机场字典 = airports_response.data;
          数据.地区字典 = regions_response.data;
          回调函数();
        })
      );
  }
}

class 机场 extends 坐标点 {
  constructor(code, 范围 = null) {
    if (!数据.机场字典[code]) {
      console.log(code);
    }
    super(数据.机场字典[code].position, 范围);
    this.IATA = code;
    this.数据 = 数据.机场字典[code];
    this.ICAO = this.数据.ICAO;
    this.城市 = this.数据.city;
    this.名称 = this.数据.name;
    this.时区 = this.数据.timezone;
  }
  toString() {
    return `${this.城市}`;
  }
  get 国家() {
    const 国家 = 数据.地区字典[this.数据.country];
    if (国家["name_zh"]) {
      return `${国家.flag} ${国家["name_zh"]}`;
    } else if (国家["name_en"]) {
      return `${国家.flag} ${国家["name_en"]}`;
    } else {
      return `${国家.flag}`;
    }
  }
  get 时差() {
    return moment().tz(this.时区).format("Z");
  }
}

class 航线 {
  toString() {
    return this.airports.map((x) => x.IATA).join("→");
  }
  constructor(input_paths) {
    this.airports = input_paths.map((x) => new 机场(x));
    this.paths = [];
    this.total_distance = 0;
    for (let i = 1; i < input_paths.length; i++) {
      const u = new 大圆线段(this.airports[i - 1], this.airports[i]);
      this.paths.push(u);
      this.total_distance += u.距离;
    }
    if (input_paths.length > 2) {
      this.direct_path = new 大圆线段(
        this.airports[0],
        this.airports[input_paths.length - 1]
      );
      this.divert = (this.total_distance / this.direct_path.距离 - 1) * 100;
    }
  }
}
