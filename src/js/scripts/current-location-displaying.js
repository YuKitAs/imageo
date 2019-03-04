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
