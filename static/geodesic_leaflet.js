const get_color = () => {
  // const colors = ["red", "blue", "yellow", "green"];
  // return colors[Math.floor(Math.random() * colors.length)];
  return "red";
};

const 基础地图 = (
  element = "map",
  provider = "Google",
  mode = "Map",
  center = 0,
  zoom = 5
) => {
  const x = L.map(element, {
    maxBounds: L.latLngBounds([90, center - 180], [-90, center + 180]),
  }).setView([0, center], zoom);
  L.tileLayer.chinaProvider(provider, { _mode: mode }).addTo(x);
  return x;
};

const 绘图线段 = (原始航线, 地图中心 = 120) => {
  const 绘图航线 = [];
  绘图航线.push([]);
  原始航线.forEach(curr => {
    let idx = 绘图航线.length - 1;
    if (绘图航线[idx].length > 1) {
      const prev = 绘图航线[idx][绘图航线[idx].length - 1];
      const cross = boundary =>
        (prev.λ.d <= boundary && curr.λ.d > boundary) ||
        (prev.λ.d > boundary && curr.λ.d <= boundary);
      if (cross(地图中心 - 180) || cross(地图中心 + 180)) {
        绘图航线.push([]);
        idx++;
      }
    }
    绘图航线[idx].push(curr);
  });
  return 绘图航线.map(x => x.map(p => p.绘图坐标(地图中心)));
};

const 绘制一个点 = (坐标, 属性, 点击函数, 目标图, 地图中心) => {
  if (!属性.color) {
    属性.color = get_color();
  }
  L.marker(坐标, 属性).on("click", 点击函数).addTo(目标图);
};
坐标点.prototype.绘图坐标 = function (地图中心) {
  return [this.φ.d, this.λ.standardize(地图中心).d];
};

坐标点.prototype.绘图 = function (
  属性,
  点击函数,
  目标图 = root.graph,
  地图中心 = root.map_center
) {
  绘制一个点(this.绘图坐标(地图中心), 属性, 点击函数, 目标图, 地图中心);
};

function 绘制一条线(
  点集,
  属性 = {},
  点击函数 = () => {},
  目标图 = root.graph,
  地图中心 = root.map_center
) {
  if (!属性.color) {
    属性.color = get_color();
  }
  L.polyline(绘图线段(点集, 地图中心), 属性)
    .on("click", 点击函数)
    .addTo(目标图);
}

大圆线段.prototype.绘图 = function (
  属性 = { color: "blue" },
  点击函数 = () => {},
  目标图 = root.graph,
  地图中心 = root.map_center
) {
  this.起.绘图();
  绘制一条线(this.大圆航线, 属性, 点击函数, 目标图, 地图中心);
  this.终.绘图();
};

机场.prototype.绘图 = function (
  属性 = {
    title: this.toString(),
  },
  目标图 = root.graph,
  点击函数 = e => {
    root.airport_modal.airport = this;
    root.airport_modal.show = true;
  },
  地图中心 = root.map_center
) {
  绘制一个点(this.绘图坐标(地图中心), 属性, 点击函数, 目标图, 地图中心);
  if (this.r) {
    绘制一条线(this.范围, 属性, 点击函数, 目标图, 地图中心);
  }
};

航线.prototype.绘图 = function (
  属性 = {},
  目标图 = root.graph,
  点击函数 = e => {},
  地图中心 = root.map_center
) {
  if (!属性.color) {
    属性.color = get_color();
  }
  this.path.forEach(x => x.绘图(属性, 点击函数, 目标图, 地图中心));
};
