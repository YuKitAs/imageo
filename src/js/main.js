require('./polyfill')
const loader = require('./loader')

const scripts = [
  require('./scripts/current-location-displaying'),
  require('./scripts/file-loading'),
  require('./scripts/locating'),
  require('./scripts/map-image-transformation'),
  require('./scripts/view-switching')
]

const globalData = {
  currentPosition: {
    latitude: 0,
    longitude: 0
  },

  viewport: {
    width: 0,
    height: 0
  },

  mapImage: {
    width: 0,
    height: 0
  },

  mapTransform: {
    offset: { x: 0, y: 0 },
    scale: 1
  }
}

const eventBus = new EventTarget()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loader.load(scripts, globalData, eventBus))
} else {
  loader.load(scripts, globalData, eventBus)
}
