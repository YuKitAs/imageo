const eventType = require('../utilities/event-type')
const geoImageTransformation = require('../utilities/geo-image-transformation')

module.exports = {
  doms: {
    currentPositionText: '#navigation-current-position-text',
    markerLayer: '#navigation-marker-layer',
    positionMarkerTemplate: '#navigation-position-marker-template',
    positionMarkerStill: '#navigation-position-marker-still',
    positionMarkerGoLeft: '#navigation-position-marker-go-left',
    positionMarkerGoRight: '#navigation-position-marker-go-right'
  },

  data: {
    pins: { mutable: false },
    imageTransform: { mutable: false },
    positionHistory: { mutable: false }
  },

  init (g) {
    g.eventBus.addEventListener(
      eventType.POSITION_UPDATED,
      event => onPositionUpdated(g, event)
    )
  }
}

function onPositionUpdated (g, event) {
  const geoCoord = event.detail

  displayCurrentPositionText(g, geoCoord)
  displayCurrentPositionMarker(g, geoCoord)
}

function displayCurrentPositionText (g, geoCoord) {
  g.doms.currentPositionText.innerText = `${geoCoord.lat.toFixed(7)}, ${geoCoord.long.toFixed(7)}`
}

function displayCurrentPositionMarker (g, geoCoord) {
  const imageDisplayCoord = calculateImageDisplayCoord(g, geoCoord)
  if (!imageDisplayCoord) return

  upsertPositionMarkerElement(g, imageDisplayCoord)
  updatePositionMarkerImage(g, geoCoord)
}

function calculateImageDisplayCoord (g, geoCoord) {
  const pins = g.data.pins.getValue()
  const imageTransform = g.data.imageTransform.getValue()

  const transformationFunction = geoImageTransformation.buildTransformation(pins)
  if (!transformationFunction) return null

  const imageCoord = transformationFunction(geoCoord)

  return {
    x: imageCoord.x * imageTransform.scale,
    y: imageCoord.y * imageTransform.scale
  }
}

function upsertPositionMarkerElement (g, imageDisplayCoord) {
  let positionMarkerElement = document.getElementById('navigation-position-marker')
  if (!positionMarkerElement) {
    positionMarkerElement = g.doms.positionMarkerTemplate.cloneNode(true)
    positionMarkerElement.id = 'navigation-position-marker'
    g.doms.markerLayer.appendChild(positionMarkerElement)
  }

  positionMarkerElement.style.transform =
    `translate(${imageDisplayCoord.x}px, ${imageDisplayCoord.y}px)`
}

function updatePositionMarkerImage (g, geoCoord) {
  const positionHistory = g.data.positionHistory.getValue()
  if (positionHistory.length < 1) {
    return switchMarkerImage(g, 'still')
  }

  const lastPosition = positionHistory[positionHistory.length - 1]
  if (geoCoord.lat - lastPosition.lat <= 0.00001 && geoCoord.long - lastPosition.long <= 0.00001) {
    switchMarkerImage(g, 'still')
  } else if (geoCoord.long - lastPosition.long >= 0) {
    switchMarkerImage(g, 'go-right')
  } else if (geoCoord.long - lastPosition.long < 0) {
    switchMarkerImage(g, 'go-left')
  }
}

function switchMarkerImage (g, name) {
  switch (name) {
    case 'still':
      g.doms.positionMarkerStill.hidden = false
      g.doms.positionMarkerGoLeft.hidden = true
      g.doms.positionMarkerGoRight.hidden = true
      break
    case 'go-left':
      g.doms.positionMarkerStill.hidden = true
      g.doms.positionMarkerGoLeft.hidden = false
      g.doms.positionMarkerGoRight.hidden = true
      break
    case 'go-right':
      g.doms.positionMarkerStill.hidden = true
      g.doms.positionMarkerGoLeft.hidden = true
      g.doms.positionMarkerGoRight.hidden = false
      break
  }
}
