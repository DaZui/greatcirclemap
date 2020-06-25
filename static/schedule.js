const path = /^(([A-Za-z]{3}-)+([A-Za-z]{3}\/)*)*[A-Za-z]{3}$/;
const range = /^\d+km@[A-Za-z]{3}$/;

const getQueryVariable = (variable) => {
  const vars = window.location.search.substring(1).split("&");
  for (const i in vars) {
    const [a, b] = vars[i].split("=");
    if (a === variable) {
      return b;
    }
  }
  return "";
};

const root = new Vue({
  components: {
    "l-map": window.Vue2Leaflet.LMap,
    "l-tile-layer": window.Vue2Leaflet.LTileLayer,
    "l-marker": window.Vue2Leaflet.LMarker,
    "l-tooltip": window.Vue2Leaflet.LTooltip,
    "l-polyline": window.Vue2Leaflet.LPolyline,
  },
  el: "#vueapp",
  data: {
    raw_query: [],
    graph: null,
    map: {
      provider: "Google",
      mode: "Satellite",
    },
    map_center: 120,
    map_zoom: 3,
    show_map: false,
    airport_modal: {
      show: false,
      airport: null,
    },
    airroute_modal: {
      show: false,
      airroute: null,
    },
  },
  computed: {
    map_options: {
      get() {
        return china_provider_options(this.map.provider, {
          _mode: this.map.mode,
        });
      },
    },
    map_center_point: {
      get() {
        return [0, this.map_center];
      },
    },
    query: {
      get() {
        const rv = {
          points: [],
          polylines: [],
          routes: [],
          ranges: [],
        };
        this.raw_query.forEach((element) => {
          element = element.toUpperCase();
          if (element.length === 3) {
            rv.points.push(new 机场(element));
          } else if (element.includes("KM@")) {
            [distance, airports] = element.split("KM@");
            const range = new 机场(airports, parseInt(distance));
            range.绘图线段(this.map_center).forEach((seg) => {
              rv.points.push(range);
              rv.polylines.push({
                pts: seg,
                route: range,
              });
            });
          } else if (element.includes("-")) {
            const nodes = element.split("-");
            const l = nodes.length;
            nodes[l - 1].split("/").forEach((last) => {
              const route = new 航线(nodes.slice(0, l - 1).concat(last));
              rv.routes.push(route);
              route.paths.forEach((path) => {
                rv.points.push(path.起);
                rv.points.push(path.终);
                path.绘图线段(this.map_center).forEach((seg) => {
                  rv.polylines.push({
                    pts: seg,
                    route: route,
                  });
                });
              });
            });
          }
        });
        return rv;
      },
    },
  },

  methods: {
    airport_onclick: function (iata) {
      this.airport_modal.airport = iata;
      this.airport_modal.show = true;
    },

    airroute_onclick: function (iata) {
      this.airroute_modal.airroute = iata;
      this.airroute_modal.show = true;
    },
    validator: (tag) => tag.match(path) || tag.match(range),
  },
  mounted: function () {
    数据.载入数据(() => {
      this.raw_query = getQueryVariable("query").split(",");
    });
  },
});
