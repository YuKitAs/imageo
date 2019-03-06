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
