const store = require('../../store/bookkeeping')
Page({
  data: { ledgers: [], activeId: '' },
  onShow() { const s = store.getState(); this.setData({ ledgers: s.ledgers, activeId: s.activeLedgerId }) },
  back() { wx.navigateBack() },
  add() { wx.navigateTo({ url: '/pages/ledger-edit/index' }) },
  edit(event) { wx.navigateTo({ url: `/pages/ledger-edit/index?id=${event.currentTarget.dataset.id}` }) },
  select(event) { store.setActiveLedger(event.currentTarget.dataset.id); wx.switchTab({ url: '/pages/ledger/index' }) }
})
