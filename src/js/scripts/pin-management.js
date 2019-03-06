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
    mapTransform: { mutable: false },
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

  const position = g.data.currentPosition.getValue()

  const currentTransform = g.data.mapTransform.getValue()
  const imageDisplayCoordinate = {
    x: viewportCoord.x - currentTransform.offset.x,
    y: viewportCoord.y - currentTransform.offset.y
  }
  const imageCoordinate = {
    x: imageDisplayCoordinate.x / currentTransform.scale,
    y: imageDisplayCoordinate.y / currentTransform.scale
  }

  const pins = g.data.pins.getValue()
  pins.push({ id, position, imageCoordinate })
  g.data.pins.setValue(pins)

  const pinElement = g.doms.pinTemplate.cloneNode(true)
  pinElement.id = `navigation-pin-${id}`
  pinElement.style.transform =
    `translate(${imageDisplayCoordinate.x}px, ${imageDisplayCoordinate.y}px)`
  pinElement.addEventListener('click', () => onPinClick(g, id))

  g.doms.markerLayer.appendChild(pinElement)
}

function stopAddingPin (g, pinAddingState) {
  pinAddingState.ongoing = false

  g.doms.mapInteractor.removeEventListener('click', pinAddingState.mapClickHandler)

  g.doms.addPinButton.style.backgroundColor = 'var(--lod-bg-color)'
}
