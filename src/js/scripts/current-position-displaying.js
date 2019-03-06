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
    imageTransform: { mutable: false }
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
  const pins = g.data.pins.getValue()
  const imageTransform = g.data.imageTransform.getValue()

  const transformationFunction = geoImageTransformation.buildTransformation(pins)
  if (!transformationFunction) return

  const imageCoord = transformationFunction(geoCoord)

  const imageDisplayCoord = {
    x: imageCoord.x * imageTransform.scale,
    y: imageCoord.y * imageTransform.scale
  }

  const positionMarkerElement = g.doms.positionMarkerTemplate.cloneNode(true)
  positionMarkerElement.style.transform =
    `translate(${imageDisplayCoord.x}px, ${imageDisplayCoord.y}px)`
  g.doms.markerLayer.appendChild(positionMarkerElement)
}
