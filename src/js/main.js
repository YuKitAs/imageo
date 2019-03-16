const loader = require('./loader')

const scripts = [
  require('./scripts/before-close-notification'),
  require('./scripts/current-position-displaying'),
  require('./scripts/file-loading'),
  require('./scripts/image-transformation'),
  require('./scripts/pin-management'),
  require('./scripts/positioning'),
  require('./scripts/view-switching')
]

const globalData = {
  currentPosition: {
    lat: 0,
    long: 0
  },

  positionHistory: [],

  viewport: {
    width: 0,
    height: 0
  },

  image: {
    width: 0,
    height: 0
  },

  imageTransform: {
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
