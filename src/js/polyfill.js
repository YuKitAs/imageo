function polyfillCustomEvent () {
  if (typeof window.CustomEvent === 'function') return false

  function CustomEvent (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null }
    var evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }

  CustomEvent.prototype = window.Event.prototype

  window.CustomEvent = CustomEvent
}

function polyfillEventTarget () {
  try {
    // eslint-disable-next-line no-new
    new EventTarget()
  } catch (err) {
    // eslint-disable-next-line no-inner-declarations
    function EventTarget () {
      return document.createElement('div')
    }

    EventTarget.prototype = window.EventTarget.prototype

    window.EventTarget = EventTarget
  }
}

polyfillCustomEvent()
polyfillEventTarget()
