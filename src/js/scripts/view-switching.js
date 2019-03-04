const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    fileSelectionView: '#file-selection-view',
    navigationView: '#navigation-view' },

  data: {},

  init (g) {
    g.doms.navigationView.style.display = 'none'

    g.eventBus.addEventListener(eventType.FILE_LOADED, () => {
      g.doms.fileSelectionView.style.display = 'none'
      g.doms.navigationView.style.display = 'block'
    })
  }
}
