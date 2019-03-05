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
