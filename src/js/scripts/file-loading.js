const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    fileSelectionInput: '#file-selection-input',
    mapImageLayer: '#navigation-map-image-layer'
  },

  data: {},

  init (g) {
    g.doms.fileSelectionInput
      .addEventListener('change', event => onFileSelect(g, event), { once: true })
  }
}

async function onFileSelect (g) {
  const imgDom = createImgDom(await loadFile(g.doms.fileSelectionInput.files[0]))
  g.doms.mapImageLayer.appendChild(imgDom)
  g.eventBus.dispatchEvent(new CustomEvent(eventType.FILE_LOADED))
}

function loadFile (file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.readAsDataURL(file)
  })
}

function createImgDom (imageDataUrl) {
  const img = document.createElement('img')
  img.src = imageDataUrl
  return img
}
