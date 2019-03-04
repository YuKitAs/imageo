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
  const imageDataUrl = await loadFile(g.doms.fileSelectionInput.files[0])
  const imageElement = await createImageElement(imageDataUrl)

  g.eventBus
    .dispatchEvent(new CustomEvent(eventType.FILE_LOADED, { detail: { image: imageElement } }))
  g.doms.mapImageLayer.appendChild(imageElement)
}

function loadFile (file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.readAsDataURL(file)
  })
}

function createImageElement (imageDataUrl) {
  return new Promise(resolve => {
    const imageElement = document.createElement('img')
    imageElement.id = 'navigation-map-image'
    imageElement.className = 'navigation-map-image'
    imageElement.addEventListener('load', () => resolve(imageElement), { once: true })
    imageElement.src = imageDataUrl
  })
}
