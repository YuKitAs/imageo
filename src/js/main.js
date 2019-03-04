require('./polyfill')
const loader = require('./loader')

const scripts = [
  require('./scripts/file-loading'),
  require('./scripts/view-switching')
]

const globalData = {
  message: 'hello world'
}

const eventBus = new EventTarget()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loader.load(scripts, globalData, eventBus))
} else {
  loader.load(scripts, globalData, eventBus)
}
