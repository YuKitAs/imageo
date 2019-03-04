(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function loadOne (script, globalData, eventBus) {
  function getDom (selector) {
    const domElements = document.querySelectorAll(selector)
    switch (domElements.length) {
      case 0: return null
      case 1: return domElements[0]
      default: return domElements
    }
  }

  function addData (localData, name, mutable) {
    if (mutable) {
      Object.defineProperty(localData, name, {
        get () { return globalData[name] },
        set (value) { globalData[name] = value }
      })
    } else {
      Object.defineProperty(localData, name, { get () { return globalData[name] } })
    }
  }

  const localDoms = {}
  for (const domKey of Object.getOwnPropertyNames(script.doms)) {
    localDoms[domKey] = getDom(script.doms[domKey])
  }

  const localData = {}
  for (const dataKey of Object.getOwnPropertyNames(script.data)) {
    addData(localData, dataKey, script.data[dataKey].mutable)
  }

  script.init({ doms: localDoms, data: localData, eventBus })
}

function load (scripts, globalData, eventBus) {
  scripts.forEach(script => loadOne(script, globalData, eventBus))
}

module.exports = { load, loadOne }

},{}],2:[function(require,module,exports){
require('./polyfill')
const loader = require('./loader')

const scripts = [
  {
    doms: { body: 'body' },
    data: { message: { mutable: true } },
    init (g) {
      g.data.message = 'hello vanilla js'
      g.doms.body.innerText = g.data.message
    }
  }
]

const globalData = {
  message: 'hello world'
}

const eventBus = new EventTarget()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loader.load(scripts, globalData, eventBus))
} else {
  loader.load(scripts, globalData, eventBus)
}

},{"./loader":1,"./polyfill":3}],3:[function(require,module,exports){
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

},{}]},{},[2]);
