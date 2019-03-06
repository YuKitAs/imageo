const interactionEventHelper = require('../utilities/interaction-event-helper')

module.exports = {
  doms: {
    addPinButton: '#navigation-add-pin-button',
    mapInteractor: '#navigation-map-interactor',
    markerLayer: '#navigation-marker-layer',
    pinTemplate: '#navigation-pin-template'
  },

  data: {
    currentPosition: { mutable: false },
    imageTransform: { mutable: false },
    pins: { mutable: true }
  },

  init (g) {
    const pinAddingState = {
      ongoing: false,
      nextPinId: 1,
      mapClickHandler: event => onMapClick(g, event, pinAddingState)
    }

    g.doms.addPinButton.addEventListener('click', () => onButtonClick(g, pinAddingState))
  }
}

function onButtonClick (g, pinAddingState) {
  if (pinAddingState.ongoing) {
    stopAddingPin(g, pinAddingState)
  } else {
    startAddingPin(g, pinAddingState)
  }
}

function onMapClick (g, event, pinAddingState) {
  doAddingPin(g, interactionEventHelper.getMousePosition(event), pinAddingState)
  stopAddingPin(g, pinAddingState)
}

function onPinClick (g, id) {
  const pins = g.data.pins.getValue()
  g.data.pins.setValue(pins.filter(pin => pin.id !== id))

  const pinElement = document.getElementById(`navigation-pin-${id}`)
  pinElement.parentNode.removeChild(pinElement)
}

function startAddingPin (g, pinAddingState) {
  pinAddingState.ongoing = true

  g.doms.mapInteractor
    .addEventListener('click', pinAddingState.mapClickHandler, { once: true })

  g.doms.addPinButton.style.backgroundColor = 'var(--lod-bg-color-highlight)'
}

function doAddingPin (g, viewportCoord, pinAddingState) {
  const id = pinAddingState.nextPinId++

  const geoCoord = g.data.currentPosition.getValue()

  const currentTransform = g.data.imageTransform.getValue()
  const imageDisplayCoord = {
    x: viewportCoord.x - currentTransform.offset.x,
    y: viewportCoord.y - currentTransform.offset.y
  }
  const imageCoord = {
    x: imageDisplayCoord.x / currentTransform.scale,
    y: imageDisplayCoord.y / currentTransform.scale
  }

  const pins = g.data.pins.getValue()
  pins.push({ id, geoCoord, imageCoord })
  g.data.pins.setValue(pins)

  const pinElement = g.doms.pinTemplate.cloneNode(true)
  pinElement.id = `navigation-pin-${id}`
  pinElement.style.transform = `translate(${imageDisplayCoord.x}px, ${imageDisplayCoord.y}px)`
  pinElement.addEventListener('click', () => onPinClick(g, id))
  g.doms.markerLayer.appendChild(pinElement)
}

function stopAddingPin (g, pinAddingState) {
  pinAddingState.ongoing = false

  g.doms.mapInteractor.removeEventListener('click', pinAddingState.mapClickHandler)

  g.doms.addPinButton.style.backgroundColor = 'var(--lod-bg-color)'
}
