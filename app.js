const store = require('./store/bookkeeping')

App({
  onLaunch() {
    store.init()
  },
  globalData: {
    store
  }
})
