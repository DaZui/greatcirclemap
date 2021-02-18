export default {
  template: '#airport',
  props: ['airport', 'center'],
  components: {
    'l-marker': window.Vue2Leaflet.LMarker,
    'l-tooltip': window.Vue2Leaflet.LTooltip
  },
  data () {
    return {
      element: null,
      show_modal: false,
      options: {
        marker: {
          // opacity: 0
        },
        tooltip: {
          // permanent: true,
          // offset: [0, 25],
          // direction: 'bottom'
        }
      }
    }
  },
  computed: {
    coordinates () {
      return this.airport.绘图坐标(this.center)
    },
    name () {
      return this.airport.名称
    },
    IATA () {
      return this.airport.IATA
    },
    ICAO () {
      return this.airport.ICAO
    },
    城市 () {
      return this.airport.城市
    },
    国家 () {
      return this.airport.国家
    },
    文字坐标 () {
      return this.airport.文字坐标
    },
    时区 () {
      return this.airport.时区
    },
    时差 () {
      return this.airport.时差
    }
  }
}
