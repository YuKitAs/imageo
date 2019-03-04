const eventType = require('../utilities/event-type')

module.exports = {
  doms: {
    fileSelectionInput: '#file-selection-input'
  },

  data: {},

  init (g) {
    g.doms.fileSelectionInput.addEventListener('input', () => onFileSelect(g))
    g.doms.fileSelectionInput.addEventListener('change', () => onFileSelect(g))
  }
}

async function onFileSelect (g) {
  const image = await loadImage(await loadFile(g.doms.fileSelectionInput.files[0]))
  g.eventBus.dispatchEvent(new CustomEvent(eventType.FILE_LOADED, { detail: { image } }))
}

function loadFile (file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.readAsDataURL(file)
  })
}

function loadImage (imageDataUrl) {
  return new Promise(resolve => {
    const image = new Image()
    image.src = imageDataUrl
    image.addEventListener('load', () => resolve(image))
  })
}
