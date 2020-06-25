const path = /^(([A-Za-z]{3}-)+([A-Za-z]{3}\/)*)*[A-Za-z]{3}$/;
const range = /^\d+km@[A-Za-z]{3}$/;

const getQueryVariable = variable => {
  const vars = window.location.search.substring(1).split("&");
  for (const i in vars) {
    const [a, b] = vars[i].split("=");
    if (a === variable) {
      return b;
    }
  }
  return "";
};



const toggleFullScreen = id => document.querySelector(id).requestFullscreen();

const send_request = () => {
  if (root.graph) { root.graph.remove(); }
  root.graph = 基础地图(
    "map",
    root.map.provider,
    root.map.mode,
    root.map_center,
    3
  );
  root.query.points.forEach(r => r.绘图());
  root.query.routes.forEach(r => r.绘图());
  root.query.ranges.forEach(r => r.绘图());
};

const root = new Vue({
  components: {
    'l-map': window.Vue2Leaflet.LMap,
    'l-tile-layer': window.Vue2Leaflet.LTileLayer,
    'l-marker': window.Vue2Leaflet.LMarker,
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
    show_map: false,
    airport_modal: {
      show: false,
      airport: null,
    },
  },
  computed: {
    query: {
      get() {
        const rv = {
          points: [],
          routes: [],
          ranges: [],
        };
        this.raw_query.forEach(element => {
          element = element.toUpperCase();
          if (element.length === 3) {
            rv.points.push(new 机场(element));
          } else if (element.includes("km@")) {
            [distance, airports] = element.split("km@");
            rv.ranges.push(new 机场(airports, parseInt(distance)));
          } else if (element.includes("-")) {
            const nodes = element.split("-");
            const l = nodes.length;
            nodes[l - 1]
              .split("/")
              .forEach(last =>
                rv.routes.push(new 航线(nodes.slice(0, l - 1).concat(last)))
              );
          }
        });
        return rv;
      },
    },
  },

  methods: {
    validator: tag => tag.match(path) || tag.match(range),
    send_request,
  },
  mounted: () => {
    数据.载入数据(() => {
      root.send_request();
      root.raw_query = getQueryVariable("query").split(",");
      if (root.raw_query.length > 0 && root.raw_query[0].length > 0) {
        sleep(200).then(root.send_request);
      }
    });
  },
});

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
