import { 航线, 机场 } from './aviation_tools/airport.js'
import { getQueryVariable } from './tools/tools.js'
import airport from './modules/airport.js'
import airroute from './modules/airroute.js'
import { getRegions, getAirports } from './tools/data.js'

const path = /^(([A-Za-z]{3}-)+([A-Za-z]{3}\/)*)*[A-Za-z]{3}$/
const range = /^\d+(km|mi|nm)@[A-Za-z]{3}$/

const root = new Vue({
  components: {
    airport,
    airroute,
    'l-map': window.Vue2Leaflet.LMap,
    'l-tile-layer': window.Vue2Leaflet.LTileLayer
  },
  el: '#vueapp',
  data: {
    show_items: false,
    airports: null,
    regions: null,
    raw_query: [],
    map: {
      provider: 'GaoDe',
      mode: 'Map'
    },
    map_center: 120,
    map_zoom: 3,
    display_nav: true
  },
  computed: {
    map_options () { return china_provider_options(this.map.provider, { _mode: this.map.mode }) },
    map_center_point () { return [0, this.map_center] },
    map_bounds () {
      return [
        [90, this.map_center + 179.9],
        [-90, this.map_center - 179.9]
      ]
    },
    upperCaseQuery () {
      return this.raw_query.map(x => x.toUpperCase())
    },
    airportsInQuery () {
      return this.upperCaseQuery.reduce((rv, element) => {
        if (element.length === 3) {
          rv.add(element)
        } else if (element.includes('@')) {
          rv.add(element.split('@')[1])
        } else if (element.includes('-')) {
          const nodes = element.split('-')
          nodes.slice(0, -1).forEach(x => rv.add(x))
          nodes[nodes.length - 1].split('/').forEach(x => rv.add(x))
        }
        return rv
      }, new Set())
    },
    rangesInQuery () {
      return this.upperCaseQuery.filter(x => x.includes('@'))
    },
    routesInQuery () {
      return this.upperCaseQuery.filter(x => x.includes('-'))
    },
    points () {
      return [...this.airportsInQuery.values()].map(this.new_airport)
    },
    ranges () {
      return this.rangesInQuery.reduce((rv, element) => {
        const [distance, airport] = element.split('@')
        const unit = distance.substring(distance.length - 2)
        const range = this.new_airport(airport,
          parseInt(distance) * { KM: 1, MI: 1.609344, NM: 1.852 }[unit])
        range.绘图线段(this.map_center).forEach((seg) => {
          rv.push({
            pts: seg,
            route: range
          })
        })
        return rv
      }, [])
    },
    polylines () {
      const rv3 = []
      this.routesInQuery.reduce((rv, element) => {
        const nodes = element.split('-')
        const l = nodes.length
        for (let i = 1; i < l - 1; i++) {
          const a = nodes[i - 1]
          const b = nodes[i]
          rv.add(a < b ? `${a}-${b}` : `${b}-${a}`)
        }
        const a = nodes[l - 2]
        nodes[l - 1].split('/').forEach(b => rv.add(a < b ? `${a}-${b}` : `${b}-${a}`))
        return rv
      }, new Set()).forEach(x => {
        const route = new 航线(x.split('-').map(this.new_airport))
        route.paths.forEach(path => path.绘图线段(this.map_center).forEach(pts => rv3.push({ pts, route })))
      })
      return rv3
    }
  },
  methods: {
    validator (tag) {
      return tag.match(path) || tag.match(range)
    },
    new_airport (iata, range = null) {
      return new 机场(iata, this.airports, this.regions, range)
    }
  },
  async created () {
    this.regions = await getRegions()
    this.airports = await getAirports()
    this.raw_query = getQueryVariable('query').split(',')
  }
})
