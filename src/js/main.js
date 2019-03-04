require('./polyfill')
const loader = require('./loader')

const scripts = [
  require('./scripts/current-location-displaying.js'),
  require('./scripts/file-loading'),
  require('./scripts/locating'),
  require('./scripts/view-switching')
]

const globalData = {
  currentPosition: {
    latitude: 0,
    longitude: 0
  }
}

const eventBus = new EventTarget()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loader.load(scripts, globalData, eventBus))
} else {
  loader.load(scripts, globalData, eventBus)
}
