const eventType = require('../utilities/event-type')

module.exports = {
  doms: {},

  data: {
    currentPosition: { mutable: true },
    positionHistory: { mutable: true }
  },

  init (g) {
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    navigator.geolocation.watchPosition(position => {
      const positionHistory = g.data.positionHistory.getValue()
      positionHistory.push(g.data.currentPosition.getValue())
      if (positionHistory.length >= 10) {
        positionHistory.shift()
      }
      g.data.positionHistory.setValue(positionHistory)

      const currentPosition = {
        lat: position.coords.latitude,
        long: position.coords.longitude
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
