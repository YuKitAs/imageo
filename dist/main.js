(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function loadOne (script, globalData, eventBus) {
  function getDom (selector) {
    const domElements = document.querySelectorAll(selector)
    switch (domElements.length) {
      case 0: return null
      case 1: return domElements[0]
      default: return domElements
    }
  }

  function addData (localData, name, mutable) {
    localData[name] = { getValue () { return JSON.parse(JSON.stringify(globalData[name])) } }
    if (mutable) {
      localData[name] = { setValue (value) { globalData[name] = value } }
    }
  }

  const localDoms = {}
  for (const domKey of Object.getOwnPropertyNames(script.doms)) {
    localDoms[domKey] = getDom(script.doms[domKey])
  }

  const localData = {}
  for (const dataKey of Object.getOwnPropertyNames(script.data)) {
    addData(localData, dataKey, script.data[dataKey].mutable)
  }

  script.init({ doms: localDoms, data: localData, eventBus })
}

function load (scripts, globalData, eventBus) {
  scripts.forEach(script => loadOne(script, globalData, eventBus))
}

module.exports = { load, loadOne }

},{}],2:[function(require,module,exports){
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

},{"./loader":1,"./polyfill":3,"./scripts/current-location-displaying.js":4,"./scripts/file-loading":5,"./scripts/locating":6,"./scripts/view-switching":7}],3:[function(require,module,exports){
function polyfillCustomEvent () {
  if (typeof window.CustomEvent === 'function') return false

  function CustomEvent (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null }
    var evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }

  CustomEvent.prototype = window.Event.prototype

  window.CustomEvent = CustomEvent
}

function polyfillEventTarget () {
  try {
    // eslint-disable-next-line no-new
    new EventTarget()
  } catch (err) {
    // eslint-disable-next-line no-inner-declarations
    function EventTarget () {
      return document.createElement('div')
    }

    EventTarget.prototype = window.EventTarget.prototype

    window.EventTarget = EventTarget
  }
}

polyfillCustomEvent()
polyfillEventTarget()

},{}],4:[function(require,module,exports){
const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    currentLocationText: '#navigation-current-location'
  },

  data: {},

  init (g) {
    g.eventBus.addEventListener(eventType.LOCATION_UPDATED, event => {
      g.doms.currentLocationText.innerText =
        `${event.detail.latitude.toFixed(8)}, ${event.detail.longitude.toFixed(8)}`
    })
  }
}

},{"../utilities/event-type":8}],5:[function(require,module,exports){
const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    fileSelectionInput: '#file-selection-input',
    mapImageLayer: '#navigation-map-image-layer'
  },

  data: {},

  init (g) {
    g.doms.fileSelectionInput
      .addEventListener('change', event => onFileSelect(g, event), { once: true })
  }
}

async function onFileSelect (g) {
  const imgDom = createImgDom(await loadFile(g.doms.fileSelectionInput.files[0]))
  g.doms.mapImageLayer.appendChild(imgDom)
  g.eventBus.dispatchEvent(new CustomEvent(eventType.FILE_LOADED))
}

function loadFile (file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.readAsDataURL(file)
  })
}

function createImgDom (imageDataUrl) {
  const img = document.createElement('img')
  img.src = imageDataUrl
  return img
}

},{"../utilities/event-type":8}],6:[function(require,module,exports){
const eventType = require('../utilities/event-type')

module.exports = {
  doms: {},

  data: {
    currentPosition: { mutable: true }
  },

  init (g) {
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    navigator.geolocation.watchPosition(position => {
      const currentPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      g.data.currentPosition.setValue(currentPosition)
      g.eventBus.dispatchEvent(
        new CustomEvent(
          eventType.LOCATION_UPDATED,
          {
            detail: currentPosition
          }
        )
      )
    }, null, options)
  }
}

},{"../utilities/event-type":8}],7:[function(require,module,exports){
const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    fileSelectionView: '#file-selection-view',
    navigationView: '#navigation-view' },

  data: {},

  init (g) {
    g.doms.navigationView.style.display = 'none'

    g.eventBus.addEventListener(eventType.FILE_LOADED, () => {
      g.doms.fileSelectionView.style.display = 'none'
      g.doms.navigationView.style.display = 'block'
    })
  }
}

},{"../utilities/event-type":8}],8:[function(require,module,exports){
module.exports = {
  FILE_LOADED: 'fileLoaded',
  LOCATION_UPDATED: 'locationUpdated'
}

},{}]},{},[2]);
