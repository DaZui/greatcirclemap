class Angle {
  static asin(x) {
    return new Angle(Math.asin(x), true);
  }
  static acos(x) {
    return new Angle(Math.acos(x), true);
  }
  static atan2(x, y) {
    return new Angle(Math.atan2(x, y), true);
  }
  constructor(raw, 弧度 = false) {
    this.d = raw * (弧度 ? 180 / Math.PI : 1);
    this.r = raw * (弧度 ? 1 : Math.PI / 180);
    this.s = Math.sin(this.r);
    this.c = Math.cos(this.r);
  }
  add(other) {
    return new Angle(this.d + other.d);
  }
  sub(other) {
    return new Angle(this.d - other.d);
  }
  mul(other) {
    return new Angle(this.d * other);
  }
  lt(other) {
    return this.d < other.d;
  }
  standardize(center = 0, period = 360, radian = false) {
    let v = this;
    const p = new Angle(period, radian);
    const c = new Angle(center, radian);
    const l = c.sub(p.mul(0.5));
    while (v.lt(l)) {
      v = v.add(p);
    }
    const r = c.add(p.mul(0.5));
    while (r.lt(v)) {
      v = v.sub(p);
    }
    return v;
  }
  get dms() {
    const k = [0, 0, (Math.abs(this.d) * 3600).toFixed(0)];
    k[0] = Math.floor(k[2] / 3600);
    k[2] -= k[0] * 3600;
    k[1] = Math.floor(k[2] / 60);
    k[2] -= k[1] * 60;
    return `${k[0]}°${k[1]}'${k[2]}"`;
  }
  sign(positive = "N", negative = "S") {
    return this.d > 0 ? positive : this.d < 0 ? negative : "";
  }
}

class 坐标点 {
  R = 6371.009;
  constructor(位置, 范围 = null, 弧度 = false) {
    this.φ = new Angle(位置[0], 弧度);
    this.λ = new Angle(位置[1], 弧度);
    this.r = 范围;
  }
  get 坐标() {
    return [this.φ.d, this.λ.d];
  }
  往(that) {
    return new 大圆线段(this, that);
  }
  延伸(距离, 方向角) {
    const θ = new Angle(方向角);
    const r = new Angle(距离 / this.R, true);
    const φ2 = Angle.asin(this.φ.s * r.c + this.φ.c * r.s * θ.c);
    const λ2 = Angle.atan2(θ.s * r.s * this.φ.c, r.c - this.φ.s * φ2.s)
      .add(this.λ)
      .standardize();
    return new 坐标点([φ2.d, λ2.d]);
  }
  get 范围() {
    if (this.r) {
      const 环 = [];
      for (let 方向角 = 0; 方向角 <= 360; 方向角 += 1) {
        环.push(this.延伸(this.r, 方向角));
      }
      return 环;
    } else {
      return null;
    }
  }

  绘图线段(地图中心 = 120) {
    return 生成绘图航线(this.范围, 地图中心);
  }
  get 文字坐标() {
    return `${this.φ.dms} ${this.φ.sign("N", "S")}, 
    ${this.λ.dms} ${this.λ.sign("E", "W")}`;
  }
  toString() {
    return this.文字坐标;
  }
  绘图坐标(地图中心) {
    return [this.φ.d, this.λ.standardize(地图中心).d];
  }
}

class 大圆线段 {
  R = 6371.009;
  constructor(起, 终) {
    this.起 = 起;
    this.终 = 终;
    this.Δλ = this.终.λ.sub(this.起.λ);
  }
  get 距离() {
    return (
      Math.acos(
        this.起.φ.s * this.终.φ.s + this.起.φ.c * this.终.φ.c * this.Δλ.c
      ) * this.R
    );
  }
  get 航向角() {
    return Angle.atan2(
      this.终.φ.c * this.Δλ.s,
      this.起.φ.c * this.终.φ.s - this.起.φ.s * this.终.φ.c * this.Δλ.c
    ).standardize(180);
  }
  中间点(比例 = 0.5) {
    const δ = new Angle(this.距离 / this.R, true);
    const a = δ.mul(1 - 比例).s / δ.s;
    const b = δ.mul(比例).s / δ.s;
    const x = a * this.起.φ.c * this.起.λ.c + b * this.终.φ.c * this.终.λ.c;
    const y = a * this.起.φ.c * this.起.λ.s + b * this.终.φ.c * this.终.λ.s;
    const z = a * this.起.φ.s + b * this.终.φ.s;
    const lat3 = Angle.atan2(z, Math.sqrt(x * x + y * y));
    const lon3 = Angle.atan2(y, x);
    return new 坐标点([lat3.d, lon3.d]);
  }
  get 大圆航线() {
    const array = [];
    for (let i = 0; i < 1; i += 10 / this.距离) {
      array.push(this.中间点(i));
    }
    array.push(this.终);
    return array;
  }
  绘图线段(地图中心 = 120) {
    return 生成绘图航线(this.大圆航线, 地图中心);
  }
}

const 生成绘图航线 = (源, 地图中心) => {
  const 绘图航线 = [];
  绘图航线.push([]);
  源.forEach((curr) => {
    let idx = 绘图航线.length - 1;
    if (绘图航线[idx].length > 1) {
      const prev = 绘图航线[idx][绘图航线[idx].length - 1];
      const cross = (boundary) =>
        (prev.λ.d <= boundary && curr.λ.d >= boundary) ||
        (curr.λ.d <= boundary && prev.λ.d >= boundary);
      if (cross(地图中心 - 179) || cross(地图中心 + 179)) {
        绘图航线.push([]);
        idx++;
      }
    }
    绘图航线[idx].push(curr);
  });
  return 绘图航线.map((x) => x.map((p) => p.绘图坐标(地图中心)));
};

export { Angle, 坐标点, 大圆线段 };
