const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    body: 'body',
    transformLayer: '#navigation-transform-layer'
  },

  data: {
    viewport: { mutable: true },
    mapImage: { mutable: true },
    mapTransform: { mutable: true }
  },

  init (g) {
    g.eventBus.addEventListener(
      eventType.FILE_LOADED,
      event => initializeTransform(g, event),
      { once: true }
    )
  }
}

function initializeTransform (g, event) {
  const viewport = g.data.viewport.getValue()
  viewport.width = g.doms.body.clientWidth
  viewport.height = g.doms.body.clientHeight
  g.data.viewport.setValue(viewport)

  const mapImage = g.data.mapImage.getValue()
  mapImage.width = event.detail.image.width
  mapImage.height = event.detail.image.height
  g.data.mapImage.setValue(mapImage)

  const mapTransform = g.data.mapTransform.getValue()
  mapTransform.offset.x = 0
  mapTransform.offset.y = 0
  mapTransform.scale = 1
  g.data.mapTransform.setValue(mapTransform)
}
