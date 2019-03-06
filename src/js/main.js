const loader = require('./loader')

const scripts = [
  require('./scripts/current-position-displaying'),
  require('./scripts/file-loading'),
  require('./scripts/map-image-transformation'),
  require('./scripts/pin-management'),
  require('./scripts/positioning'),
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
  },

  pins: []
}

const eventBus = new EventTarget()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loader.load(scripts, globalData, eventBus))
} else {
  loader.load(scripts, globalData, eventBus)
}
