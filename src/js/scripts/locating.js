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
