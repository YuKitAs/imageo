module.exports = {
  doms: {},

  data: {},

  init () {
    window.addEventListener('beforeunload', event => {
      event.returnValue = 'Do you really want to close this page?'
    })
  }
}
