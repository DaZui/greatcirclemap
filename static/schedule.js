const getQueryVariable = variable => {
  const vars = window.location.search.substring(1).split("&")
  for (const i in vars) {
    const [a, b] = vars[i].split("=")
    if (a === variable) {
      return b
    }
  }
  return ""
}

const toggleFullScreen = (id) => {
  let elem = document.querySelector(id)

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
    })
  } else {
    document.exitFullscreen()
  }
}

const send_request = () => {
  if (root.graph) {
    root.graph.remove()
    root.graph = null
  }
  const center = 120
  root.graph = L.map("map", {
    maxBounds: L.latLngBounds([89, center - 179], [-89, center + 179])
  }).setView([35, center], 0)
  L.tileLayer.chinaProvider("Google", {
    '_mode': 'Terrain'
  }).addTo(root.graph)

  root.airports = {}
  root.airroutes = []
  const requests = root.question_modal.query.toUpperCase().split(/\n+|,+|;+/)
  const p = requests.map(e => e.match(/[A-Z]{3}/g))
  p.forEach(IATAcodes => {
    if (!IATAcodes) {
      return
    }
    if (IATAcodes.length >= 2) {
      const a = new 航线(IATAcodes)
      a.绘图({
        color: 'blue'
      })
      root.airroutes.push(a)
    }
    IATAcodes.forEach(x => {
      if (!(x in root.airports)) {
        const a = new 机场(x)
        a.绘图()
        root.airports[x] = a
      }
    })
  })
  const ranges = requests.map(e => e.match(/\d+KM@[A-Z]{3}/g))
  for (let x in ranges) {
    if (!ranges[x]) {
      continue
    }
    ranges[x].forEach(r => {
      const [a, b] = r.split("KM@")
      绘制一条线(root.airports[b].位置.范围(a), {
        color: 'yellow'
      })
    })
  }
}

const root = new Vue({
  el: '#vueapp',
  data: {
    airports: {},
    airroutes: [],
    question_modal: {
      show: false,
      query: "SYD-LHR, 17000KM@LHR, 17000KM@SYD",
    },
    aboutShow: false,
    graph: null,
    airport_modal: {
      show: false,
      airport: null
    }
  },
  methods: {
    send_request
  },
  mounted: () => {
    数据.载入数据(() => {
      root.question_modal.query = getQueryVariable("query")
      if (root.question_modal.query.length > 0) {
        root.question_modal.show = false
        root.send_request()
      } else {
        root.question_modal.show = true
      }
    })
  }
})