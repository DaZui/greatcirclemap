export default {
  template: '#airroute',
  props: ['path', 'center'],
  components: {
    'l-tooltip': window.Vue2Leaflet.LTooltip,
    'l-polyline': window.Vue2Leaflet.LPolyline
  },
  data () {
    return {
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
    dashArray () {
      return '10,0'
    },
    pts () {
      return this.path.pts
    },
    color () {
      return 'red'
    },
    route () {
      return this.path.route
    }
  }
}
