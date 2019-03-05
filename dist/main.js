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
    localData[name] = {}
    localData[name].getValue = () => { return JSON.parse(JSON.stringify(globalData[name])) }
    if (mutable) {
      localData[name].setValue = value => { globalData[name] = value }
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

},{"./loader":1,"./polyfill":3,"./scripts/current-location-displaying":4,"./scripts/file-loading":5,"./scripts/locating":6,"./scripts/map-image-transformation":7,"./scripts/view-switching":8}],3:[function(require,module,exports){
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

},{"../utilities/event-type":9}],5:[function(require,module,exports){
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
  const imageDataUrl = await loadFile(g.doms.fileSelectionInput.files[0])
  const imageElement = await createImageElement(imageDataUrl)

  g.eventBus
    .dispatchEvent(new CustomEvent(eventType.FILE_LOADED, { detail: { image: imageElement } }))
  g.doms.mapImageLayer.appendChild(imageElement)
}

function loadFile (file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.readAsDataURL(file)
  })
}

function createImageElement (imageDataUrl) {
  return new Promise(resolve => {
    const imageElement = document.createElement('img')
    imageElement.id = 'navigation-map-image'
    imageElement.className = 'navigation-map-image'
    imageElement.addEventListener('load', () => resolve(imageElement), { once: true })
    imageElement.src = imageDataUrl
  })
}

},{"../utilities/event-type":9}],6:[function(require,module,exports){
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

},{"../utilities/event-type":9}],7:[function(require,module,exports){
const eventType = require('../utilities/event-type')
const interactionEventHelper = require('../utilities/interaction-event-helper')
const transformationHelper = require('../utilities/transformation-helper')

module.exports = {
  doms: {
    body: 'body',
    transformationController: '#navigation-transformation-controller',
    translatedLayer: '#navigation-translated-layer',
    scaledLayer: '#navigation-scaled-layer'
  },

  data: {
    viewport: { mutable: true },
    mapImage: { mutable: true },
    mapTransform: { mutable: true }
  },

  init (g) {
    const transformationState = {
      ongoing: false,
      lastPosition: { x: 0, y: 0 },
      lastDistance: 0
    }

    g.eventBus
      .addEventListener(eventType.FILE_LOADED, event => onFileLoaded(g, event), { once: true })

    window
      .addEventListener('resize', () => onWindowResize(g))

    g.doms.transformationController
      .addEventListener('contextmenu', event => event.preventDefault())
    g.doms.transformationController
      .addEventListener('mousedown', event => onMouseDown(event, transformationState))
    g.doms.transformationController
      .addEventListener('mousemove', event => onMouseMove(g, event, transformationState))
    g.doms.transformationController
      .addEventListener('mouseup', () => onMouseUp(transformationState))
    g.doms.transformationController
      .addEventListener('wheel', event => onWheel(g, event))
    g.doms.transformationController
      .addEventListener('touchstart', event => onTouchStart(event, transformationState))
    g.doms.transformationController
      .addEventListener('touchmove', event => onTouchMove(g, event, transformationState))
    g.doms.transformationController
      .addEventListener('touchend', () => onTouchEnd(transformationState))
  }
}

function onFileLoaded (g, event) {
  const viewport = g.data.viewport.getValue()
  viewport.width = g.doms.body.clientWidth
  viewport.height = g.doms.body.clientHeight
  g.data.viewport.setValue(viewport)

  const mapImage = g.data.mapImage.getValue()
  mapImage.width = event.detail.image.width
  mapImage.height = event.detail.image.height
  g.data.mapImage.setValue(mapImage)

  const mapTransform = g.data.mapTransform.getValue()
  mapTransform.offset.x = (viewport.width - mapImage.width) / 2
  mapTransform.offset.y = (viewport.height - mapImage.height) / 2
  mapTransform.scale = 1
  g.data.mapTransform.setValue(mapTransform)

  applyTransform(g)
}

function onWindowResize (g) {
  const lastViewport = g.data.viewport.getValue()

  const viewport = g.data.viewport.getValue()
  viewport.width = g.doms.body.clientWidth
  viewport.height = g.doms.body.clientHeight
  g.data.viewport.setValue(viewport)

  const newTransform = transformationHelper.calculateMapImageTransform(
    g.data.viewport.getValue(),
    g.data.mapImage.getValue(),
    g.data.mapTransform.getValue(),
    {
      position: { x: viewport.width / 2, y: viewport.height / 2 },
      distance: 1,
      lastPosition: { x: lastViewport.width / 2, y: lastViewport.height / 2 },
      lastDistance: 1
    })

  g.data.mapTransform.setValue(newTransform)

  applyTransform(g)
}

function onMouseDown (event, transformationState) {
  startTransformation(interactionEventHelper.getMousePosition(event), 0, transformationState)
}

function onMouseMove (g, event, transformationState) {
  doTransformation(g, interactionEventHelper.getMousePosition(event), 0, transformationState)
}

function onMouseUp (transformationState) {
  stopTransformation(transformationState)
}

function onWheel (g, event) {
  const viewport = g.data.viewport.getValue()

  const newTransform = transformationHelper.calculateMapImageTransform(
    viewport,
    g.data.mapImage.getValue(),
    g.data.mapTransform.getValue(),
    {
      position: interactionEventHelper.getMousePosition(event),
      distance: viewport.width,
      lastPosition: interactionEventHelper.getMousePosition(event),
      lastDistance: viewport.width + interactionEventHelper.getWheelDistance(event)
    })

  g.data.mapTransform.setValue(newTransform)

  applyTransform(g)
}

function onTouchStart (event, transformationState) {
  startTransformation(
    interactionEventHelper.getTouchPosition(event),
    interactionEventHelper.getTouchDistance(event),
    transformationState
  )
}

function onTouchMove (g, event, transformationState) {
  doTransformation(g,
    interactionEventHelper.getTouchPosition(event),
    interactionEventHelper.getTouchDistance(event),
    transformationState
  )
}

function onTouchEnd (transformationState) {
  stopTransformation(transformationState)
}

function startTransformation (position, distance, transformationState) {
  transformationState.ongoing = true
  transformationState.lastPosition = {
    x: position.x,
    y: position.y
  }
  transformationState.lastDistance = distance
}

function doTransformation (g, position, distance, transformationState) {
  if (!transformationState.ongoing) return

  const newTransform = transformationHelper.calculateMapImageTransform(
    g.data.viewport.getValue(),
    g.data.mapImage.getValue(),
    g.data.mapTransform.getValue(),
    {
      position,
      distance,
      lastPosition: transformationState.lastPosition,
      lastDistance: transformationState.lastDistance
    })

  g.data.mapTransform.setValue(newTransform)

  applyTransform(g)

  transformationState.lastPosition = {
    x: position.x,
    y: position.y
  }
  transformationState.lastDistance = distance
}

function stopTransformation (transformationState) {
  if (!transformationState.ongoing) return

  transformationState.ongoing = false
  transformationState.lastPosition = {
    x: 0,
    y: 0
  }
  transformationState.lastDistance = 0
}

function applyTransform (g) {
  const mapTransform = g.data.mapTransform.getValue()
  g.doms.translatedLayer.style.transform =
    `translate(${mapTransform.offset.x}px, ${mapTransform.offset.y}px)`
  g.doms.scaledLayer.style.transform =
    `scale(${mapTransform.scale})`
}

},{"../utilities/event-type":9,"../utilities/interaction-event-helper":10,"../utilities/transformation-helper":11}],8:[function(require,module,exports){
const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    fileSelectionView: '#file-selection-view',
    navigationView: '#navigation-view'
  },

  data: {},

  init (g) {
    g.doms.navigationView.style.display = 'none'

    g.eventBus.addEventListener(eventType.FILE_LOADED, () => {
      g.doms.fileSelectionView.style.display = 'none'
      g.doms.navigationView.style.display = 'block'
    }, { once: true })
  }
}

},{"../utilities/event-type":9}],9:[function(require,module,exports){
module.exports = {
  FILE_LOADED: 'fileLoaded',
  LOCATION_UPDATED: 'locationUpdated'
}

},{}],10:[function(require,module,exports){
module.exports = {
  getMousePosition (event) {
    return {
      x: event.clientX,
      y: event.clientY
    }
  },

  getTouchPosition (event) {
    let sumX = 0
    let sumY = 0
    for (const touch of event.touches) {
      sumX += touch.clientX
      sumY += touch.clientY
    }

    return {
      x: sumX / event.touches.length,
      y: sumY / event.touches.length
    }
  },

  getTouchDistance (event) {
    if (event.touches.length < 2) {
      return 0
    }

    return Math.sqrt(
      (event.touches[0].clientX - event.touches[1].clientX) ** 2 +
      (event.touches[0].clientY - event.touches[1].clientY) ** 2
    )
  },

  getWheelDistance (event) {
    const PIXEL_SCALE_RATIO = 0.2
    const LINE_SCALE_RATIO = PIXEL_SCALE_RATIO * 150
    const PAGE_SCALE_RATIO = PIXEL_SCALE_RATIO * 900

    switch (event.deltaMode) {
      case 0x00:
        return -event.deltaY * PIXEL_SCALE_RATIO
      case 0x01:
        return -event.deltaY * LINE_SCALE_RATIO
      case 0x02:
        return -event.deltaY * PAGE_SCALE_RATIO
      default:
        return 1
    }
  }
}

},{}],11:[function(require,module,exports){
module.exports = {
  calculateMapImageTransform (
    viewportDimension,
    mapImageDimension,
    currentTransform,
    {
      position,
      distance,
      lastPosition,
      lastDistance
    }
  ) {
    const MINIMUM_SCALE = 0.2
    const MAXIMUM_SCALE = 5.0

    const newTransform = {
      offset: { x: 0, y: 0 },
      scale: 1
    }

    const displayDimension = {
      width: mapImageDimension.width * currentTransform.scale,
      height: mapImageDimension.height * currentTransform.scale
    }

    const imagePivot = {
      x: lastPosition.x - currentTransform.offset.x,
      y: lastPosition.y - currentTransform.offset.y
    }

    let scaleRatio = distance / lastDistance || 1

    newTransform.scale = currentTransform.scale * scaleRatio
    if (newTransform.scale > MAXIMUM_SCALE) {
      newTransform.scale = MAXIMUM_SCALE
      scaleRatio = newTransform.scale / currentTransform.scale
    } else if (newTransform.scale < MINIMUM_SCALE) {
      newTransform.scale = MINIMUM_SCALE
      scaleRatio = newTransform.scale / currentTransform.scale
    }
    displayDimension.width *= scaleRatio
    displayDimension.height *= scaleRatio
    imagePivot.x *= scaleRatio
    imagePivot.y *= scaleRatio

    newTransform.offset.x = position.x - imagePivot.x
    newTransform.offset.y = position.y - imagePivot.y

    if (displayDimension.width > viewportDimension.width) {
      if (newTransform.offset.x > 0) {
        newTransform.offset.x = 0
      }
      if (newTransform.offset.x < viewportDimension.width - displayDimension.width) {
        newTransform.offset.x = viewportDimension.width - displayDimension.width
      }
    } else {
      newTransform.offset.x = (viewportDimension.width - displayDimension.width) / 2
    }

    if (displayDimension.height > viewportDimension.height) {
      if (newTransform.offset.y > 0) {
        newTransform.offset.y = 0
      }
      if (newTransform.offset.y < viewportDimension.height - displayDimension.height) {
        newTransform.offset.y = viewportDimension.height - displayDimension.height
      }
    } else {
      newTransform.offset.y = (viewportDimension.height - displayDimension.height) / 2
    }

    return newTransform
  }
}

},{}]},{},[2]);
