const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    fileSelectionView: '#file-selection-view',
    navigationView: '#navigation-view'
  },

  data: {},

  init (g) {
    g.eventBus.addEventListener(eventType.FILE_LOADED, () => {
      g.doms.fileSelectionView.hidden = true
      g.doms.navigationView.hidden = false
    }, { once: true })
  }
}
