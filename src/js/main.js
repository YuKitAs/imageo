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
