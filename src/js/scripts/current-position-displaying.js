const eventType = require('../utilities/event-type')
const geoImageTransformation = require('../utilities/geo-image-transformation')

module.exports = {
  doms: {
    currentPositionText: '#navigation-current-position-text',
    markerLayer: '#navigation-marker-layer',
    positionMarkerTemplate: '#navigation-position-marker-template'
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

    positionMarkerElement.querySelector('#navigation-position-marker-still-template').id =
      'navigation-position-marker-still'
    positionMarkerElement.querySelector('#navigation-position-marker-go-left-template').id =
      'navigation-position-marker-go-left'
    positionMarkerElement.querySelector('#navigation-position-marker-go-right-template').id =
      'navigation-position-marker-go-right'

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

function switchMarkerImage (name) {
  const positionMarkerStill = document.getElementById('navigation-position-marker-still')
  const positionMarkerGoLeft = document.getElementById('navigation-position-marker-go-left')
  const positionMarkerGoRight = document.getElementById('navigation-position-marker-go-right')

  switch (name) {
    case 'still':
      positionMarkerStill.hidden = false
      positionMarkerGoLeft.hidden = true
      positionMarkerGoRight.hidden = true
      break
    case 'go-left':
      positionMarkerStill.hidden = true
      positionMarkerGoLeft.hidden = false
      positionMarkerGoRight.hidden = true
      break
    case 'go-right':
      positionMarkerStill.hidden = true
      positionMarkerGoLeft.hidden = true
      positionMarkerGoRight.hidden = false
      break
  }
}
