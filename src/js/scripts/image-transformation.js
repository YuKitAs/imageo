const eventType = require('../utilities/event-type')
const geoImageTransformation = require('../utilities/geo-image-transformation')
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
    image: { mutable: true },
    imageTransform: { mutable: true },
    currentPosition: { mutable: false },
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

  const image = g.data.image.getValue()
  image.width = event.detail.image.width
  image.height = event.detail.image.height
  g.data.image.setValue(image)

  const imageTransform = g.data.imageTransform.getValue()
  imageTransform.offset.x = (viewport.width - image.width) / 2
  imageTransform.offset.y = (viewport.height - image.height) / 2
  imageTransform.scale = 1
  g.data.imageTransform.setValue(imageTransform)

  applyTransform(g, imageTransform)
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

  g.data.imageTransform.setValue(newTransform)

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

  g.data.imageTransform.setValue(newTransform)

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

  g.data.imageTransform.setValue(newTransform)

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
  const image = g.data.image.getValue()
  const oldTransform = g.data.imageTransform.getValue()

  const newTransform = {
    offset: { x: 0, y: 0 },
    scale: 1
  }

  const displayDimension = {
    width: image.width * oldTransform.scale,
    height: image.height * oldTransform.scale
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
  const imageTransform = g.data.imageTransform.getValue()
  const pins = g.data.pins.getValue()
  const currentPosition = g.data.currentPosition.getValue()

  function applyImageTransform () {
    g.doms.translatedLayer.style.transform =
      `translate(${imageTransform.offset.x}px, ${imageTransform.offset.y}px)`
    g.doms.scaledLayer.style.transform =
      `scale(${imageTransform.scale})`
  }

  function applyPinsTransform () {
    for (const pin of pins) {
      const pinDom = document.getElementById(`navigation-pin-${pin.id}`)
      const imageDisplayCoord = {
        x: pin.imageCoord.x * imageTransform.scale,
        y: pin.imageCoord.y * imageTransform.scale
      }

      pinDom.style.transform =
        `translate(${imageDisplayCoord.x}px, ${imageDisplayCoord.y}px)`
    }
  }

  function applyPositionMarkerTransform () {
    const positionMarkerDom = document.getElementById('navigation-position-marker')
    if (!positionMarkerDom) return

    const transformationFunction = geoImageTransformation.buildTransformation(pins)
    if (!transformationFunction) return

    const imageCoord = transformationFunction(currentPosition)

    const imageDisplayCoord = {
      x: imageCoord.x * imageTransform.scale,
      y: imageCoord.y * imageTransform.scale
    }

    positionMarkerDom.style.transform =
      `translate(${imageDisplayCoord.x}px, ${imageDisplayCoord.y}px)`
  }

  applyImageTransform()
  applyPinsTransform()
  applyPositionMarkerTransform()
}
