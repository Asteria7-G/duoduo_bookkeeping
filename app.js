const store = require('./store/bookkeeping')

App({
  onLaunch() {
    wx.hideTabBar({ animation:false })
    store.init()
  },
  globalData: {
    store
  }
})
