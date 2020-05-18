const path = /^(([A-z]{3}-)+([A-z]{3}\/)*)*[A-z]{3}$/;
const range = /^\d+km@[A-z]{3}$/;

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

const toggleFullScreen = id => {
  let elem = document.querySelector(id);

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      alert(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
      );
    });
  } else {
    document.exitFullscreen();
  }
};

const send_request = () => {
  if (root.graph) {
    root.graph.remove();
    root.graph = null;
  }
  const center = 120;
  root.graph = L.map("map", {
    maxBounds: L.latLngBounds([89, center - 179], [-89, center + 179]),
  }).setView([35, center], 0);
  L.tileLayer
    .chinaProvider("Google", {
      _mode: "Terrain",
    })
    .addTo(root.graph);

  root.points.points.forEach(IATAcodes => new 机场(IATAcodes).绘图());
  root.points.routes.forEach(route => {
    const l = route.length;
    const a = route.slice(0, l - 1);
    a.forEach(IATAcodes => new 机场(IATAcodes).绘图());
    route[l - 1].forEach(last => {
      new 机场(last).绘图();
      new 航线(a.concat([last])).绘图({
        color: "blue",
      });
    });
  });

  root.points.ranges.forEach(r => {
    const a = new 机场(r[0]);
    a.绘图();
    绘制一条线(a.位置.范围(r[1]), {
      color: "yellow",
    });
  });
};

const root = new Vue({
  el: "#vueapp",
  data: {
    airports: {},
    airroutes: [],
    question_modal: {
      show: false,
      query: [],
    },
    aboutShow: false,
    graph: null,
    airport_modal: {
      show: false,
      airport: null,
    },
  },
  computed: {
    points: {
      get() {
        const rv = {
          points: [],
          routes: [],
          ranges: [],
        };
        this.question_modal.query.map(element => {
          if (element.length === 3) {
            rv.points.push(element);
          } else if (element.includes("km@")) {
            [distance, airports] = element.split("km@");
            rv.ranges.push([airports, parseInt(distance)]);
          } else {
            const nodes = element.split("-");
            nodes[nodes.length - 1] = nodes[nodes.length - 1].split("/");
            rv.routes.push(nodes);
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
      root.question_modal.query = getQueryVariable("query");
      if (root.question_modal.query.length > 0) {
        root.question_modal.show = false;
        root.send_request();
      } else {
        root.question_modal.show = true;
      }
    });
  },
});
