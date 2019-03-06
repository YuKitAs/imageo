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
    localData[name].getValue = () => JSON.parse(JSON.stringify(globalData[name]))
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

},{"./loader":1,"./scripts/current-position-displaying":3,"./scripts/file-loading":4,"./scripts/map-image-transformation":5,"./scripts/pin-management":6,"./scripts/positioning":7,"./scripts/view-switching":8}],3:[function(require,module,exports){
const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    currentPositionText: '#navigation-current-position-text'
  },

  data: {},

  init (g) {
    g.eventBus.addEventListener(eventType.POSITION_UPDATED, event => {
      g.doms.currentPositionText.innerText =
        `${event.detail.latitude.toFixed(7)}, ${event.detail.longitude.toFixed(7)}`
    })
  }
}

},{"../utilities/event-type":9}],4:[function(require,module,exports){
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

},{"../utilities/event-type":9}],5:[function(require,module,exports){
const eventType = require('../utilities/event-type')
const interactionEventHelper = require('../utilities/interaction-event-helper')

module.exports = {
  doms: {
    body: 'body',
    mapInteractor: '#navigation-map-interactor',
    translatedLayer: '#navigation-translated-layer',
    scaledLayer: '#navigation-scaled-layer'
  },

  data: {
    viewport: { mutable: true },
    mapImage: { mutable: true },
    mapTransform: { mutable: true },
    pins: { mutable: false }
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

    g.doms.mapInteractor
      .addEventListener('contextmenu', event => event.preventDefault())
    g.doms.mapInteractor
      .addEventListener('mousedown', event => onMouseDown(event, transformationState))
    g.doms.mapInteractor
      .addEventListener('mousemove', event => onMouseMove(g, event, transformationState))
    g.doms.mapInteractor
      .addEventListener('mouseup', () => onMouseUp(transformationState))
    g.doms.mapInteractor
      .addEventListener('wheel', event => onWheel(g, event))
    g.doms.mapInteractor
      .addEventListener('touchstart', event => onTouchStart(event, transformationState))
    g.doms.mapInteractor
      .addEventListener('touchmove', event => onTouchMove(g, event, transformationState))
    g.doms.mapInteractor
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

  applyTransform(g, mapTransform)
}

function onWindowResize (g) {
  const lastViewport = g.data.viewport.getValue()

  const viewport = g.data.viewport.getValue()
  viewport.width = g.doms.body.clientWidth
  viewport.height = g.doms.body.clientHeight
  g.data.viewport.setValue(viewport)

  const newTransform = calculateTransform(
    g,
    { x: viewport.width / 2, y: viewport.height / 2 },
    { x: lastViewport.width / 2, y: lastViewport.height / 2 },
    1,
    1
  )

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

  const newTransform = calculateTransform(
    g,
    interactionEventHelper.getMousePosition(event),
    interactionEventHelper.getMousePosition(event),
    viewport.width,
    viewport.width + interactionEventHelper.getWheelDistance(event)
  )

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

  const newTransform = calculateTransform(
    g,
    position,
    transformationState.lastPosition,
    distance,
    transformationState.lastDistance
  )

  g.data.mapTransform.setValue(newTransform)

  applyTransform(g, newTransform)

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

function calculateTransform (g, position, lastPosition, distance, lastDistance) {
  const MINIMUM_SCALE = 0.2
  const MAXIMUM_SCALE = 5.0

  const viewport = g.data.viewport.getValue()
  const mapImage = g.data.mapImage.getValue()
  const oldTransform = g.data.mapTransform.getValue()

  const newTransform = {
    offset: { x: 0, y: 0 },
    scale: 1
  }

  const displayDimension = {
    width: mapImage.width * oldTransform.scale,
    height: mapImage.height * oldTransform.scale
  }

  const imagePivot = {
    x: lastPosition.x - oldTransform.offset.x,
    y: lastPosition.y - oldTransform.offset.y
  }

  let scaleRatio = distance / lastDistance || 1

  newTransform.scale = oldTransform.scale * scaleRatio
  if (newTransform.scale > MAXIMUM_SCALE) {
    newTransform.scale = MAXIMUM_SCALE
    scaleRatio = newTransform.scale / oldTransform.scale
  } else if (newTransform.scale < MINIMUM_SCALE) {
    newTransform.scale = MINIMUM_SCALE
    scaleRatio = newTransform.scale / oldTransform.scale
  }
  displayDimension.width *= scaleRatio
  displayDimension.height *= scaleRatio
  imagePivot.x *= scaleRatio
  imagePivot.y *= scaleRatio

  newTransform.offset.x = position.x - imagePivot.x
  newTransform.offset.y = position.y - imagePivot.y

  if (displayDimension.width > viewport.width) {
    if (newTransform.offset.x > 0) {
      newTransform.offset.x = 0
    }
    if (newTransform.offset.x < viewport.width - displayDimension.width) {
      newTransform.offset.x = viewport.width - displayDimension.width
    }
  } else {
    newTransform.offset.x = (viewport.width - displayDimension.width) / 2
  }

  if (displayDimension.height > viewport.height) {
    if (newTransform.offset.y > 0) {
      newTransform.offset.y = 0
    }
    if (newTransform.offset.y < viewport.height - displayDimension.height) {
      newTransform.offset.y = viewport.height - displayDimension.height
    }
  } else {
    newTransform.offset.y = (viewport.height - displayDimension.height) / 2
  }

  return newTransform
}

function applyTransform (g) {
  const transform = g.data.mapTransform.getValue()

  applyMapImageTransform(g, transform)
  applyPinsTransform(g, transform)
}

function applyMapImageTransform (g, transform) {
  g.doms.translatedLayer.style.transform =
    `translate(${transform.offset.x}px, ${transform.offset.y}px)`
  g.doms.scaledLayer.style.transform =
    `scale(${transform.scale})`
}

function applyPinsTransform (g, transform) {
  for (const pin of g.data.pins.getValue()) {
    const pinDom = document.getElementById(`navigation-pin-${pin.id}`)
    const imageDisplayCoordinate = {
      x: pin.imageCoordinate.x * transform.scale,
      y: pin.imageCoordinate.y * transform.scale
    }

    pinDom.style.transform =
      `translate(${imageDisplayCoordinate.x}px, ${imageDisplayCoordinate.y}px)`
  }
}

},{"../utilities/event-type":9,"../utilities/interaction-event-helper":10}],6:[function(require,module,exports){
const interactionEventHelper = require('../utilities/interaction-event-helper')

module.exports = {
  doms: {
    addPinButton: '#navigation-add-pin-button',
    mapInteractor: '#navigation-map-interactor',
    markerLayer: '#navigation-marker-layer',
    pinTemplate: '#navigation-pin-template'
  },

  data: {
    currentPosition: { mutable: false },
    mapTransform: { mutable: false },
    pins: { mutable: true }
  },

  init (g) {
    const pinAddingState = {
      ongoing: false,
      nextPinId: 1,
      mapClickHandler: event => onMapClick(g, event, pinAddingState)
    }

    g.doms.addPinButton.addEventListener('click', () => onButtonClick(g, pinAddingState))
  }
}

function onButtonClick (g, pinAddingState) {
  if (pinAddingState.ongoing) {
    stopAddingPin(g, pinAddingState)
  } else {
    startAddingPin(g, pinAddingState)
  }
}

function onMapClick (g, event, pinAddingState) {
  doAddingPin(g, interactionEventHelper.getMousePosition(event), pinAddingState)
  stopAddingPin(g, pinAddingState)
}

function onPinClick (g, id) {
  const pins = g.data.pins.getValue()
  g.data.pins.setValue(pins.filter(pin => pin.id !== id))

  const pinElement = document.getElementById(`navigation-pin-${id}`)
  pinElement.parentNode.removeChild(pinElement)
}

function startAddingPin (g, pinAddingState) {
  pinAddingState.ongoing = true

  g.doms.mapInteractor
    .addEventListener('click', pinAddingState.mapClickHandler, { once: true })

  g.doms.addPinButton.style.backgroundColor = 'var(--lod-bg-color-highlight)'
}

function doAddingPin (g, viewportCoord, pinAddingState) {
  const id = pinAddingState.nextPinId++

  const position = g.data.currentPosition.getValue()

  const currentTransform = g.data.mapTransform.getValue()
  const imageDisplayCoordinate = {
    x: viewportCoord.x - currentTransform.offset.x,
    y: viewportCoord.y - currentTransform.offset.y
  }
  const imageCoordinate = {
    x: imageDisplayCoordinate.x / currentTransform.scale,
    y: imageDisplayCoordinate.y / currentTransform.scale
  }

  const pins = g.data.pins.getValue()
  pins.push({ id, position, imageCoordinate })
  g.data.pins.setValue(pins)

  const pinElement = g.doms.pinTemplate.cloneNode(true)
  pinElement.id = `navigation-pin-${id}`
  pinElement.style.transform =
    `translate(${imageDisplayCoordinate.x}px, ${imageDisplayCoordinate.y}px)`
  pinElement.addEventListener('click', () => onPinClick(g, id))

  g.doms.markerLayer.appendChild(pinElement)
}

function stopAddingPin (g, pinAddingState) {
  pinAddingState.ongoing = false

  g.doms.mapInteractor.removeEventListener('click', pinAddingState.mapClickHandler)

  g.doms.addPinButton.style.backgroundColor = 'var(--lod-bg-color)'
}

},{"../utilities/interaction-event-helper":10}],7:[function(require,module,exports){
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
          eventType.POSITION_UPDATED,
          {
            detail: currentPosition
          }
        )
      )
    }, null, options)
  }
}

},{"../utilities/event-type":9}],8:[function(require,module,exports){
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
  POSITION_UPDATED: 'positionUpdated'
}

},{}],10:[function(require,module,exports){
function getMousePosition (event) {
  return {
    x: event.clientX,
    y: event.clientY
  }
}

function getWheelDistance (event) {
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

function getTouchPosition (event) {
  const touches = event.type === 'touchend'
    ? event.changedTouches
    : event.touches

  let sumX = 0
  let sumY = 0
  for (const touch of touches) {
    sumX += touch.clientX
    sumY += touch.clientY
  }

  return {
    x: sumX / touches.length,
    y: sumY / touches.length
  }
}

function getTouchDistance (event) {
  const touches = event.type === 'touchend'
    ? event.changedTouches
    : event.touches

  if (touches.length < 2) {
    return 0
  }

  return Math.sqrt(
    (touches[0].clientX - touches[1].clientX) ** 2 +
    (touches[0].clientY - touches[1].clientY) ** 2
  )
}

module.exports = {
  getMousePosition,
  getWheelDistance,
  getTouchPosition,
  getTouchDistance
}

},{}]},{},[2]);
