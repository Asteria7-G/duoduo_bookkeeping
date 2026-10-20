const store = require('../../store/bookkeeping')
Page({
  data: { id:'', name:'', monthlySummary:true, budget:'', assets:[], assetIndex:0, canDelete:false },
  onLoad(options = {}) {
    const state = store.getState()
    const existing = options.id ? state.ledgers.find(item => item.id === options.id) : null
    const model = existing || { name:'', monthlySummary:true, budget:3000, assetId:state.assets[0] && state.assets[0].id }
    this.setData({
      id:existing ? existing.id : '', name:model.name, monthlySummary:model.monthlySummary, budget:model.budget,
      assets:state.assets, assetIndex:Math.max(0, state.assets.findIndex(item => item.id === model.assetId)),
      canDelete:!!existing && state.ledgers.length > 1
    })
  },
  back() { wx.navigateBack() },
  inputName(event) { this.setData({ name:event.detail.value }) },
  inputBudget(event) { this.setData({ budget:event.detail.value }) },
  toggleSummary(event) { this.setData({ monthlySummary:event.detail.value }) },
  chooseAsset(event) { this.setData({ assetIndex:Number(event.detail.value) }) },
  save() {
    const name = this.data.name.trim()
    if (!name) return wx.showToast({ title:'请填写账本名称', icon:'none' })
    const asset = this.data.assets[this.data.assetIndex]
    if (!asset) return wx.showToast({ title:'请先添加资产账户', icon:'none' })
    store.saveLedger({
      id:this.data.id, name, monthlySummary:this.data.monthlySummary,
      budget:Number(this.data.budget) || 0, assetId:asset.id
    })
    wx.showToast({ title:'已保存' })
    setTimeout(() => wx.navigateBack(), 450)
  },
  remove() {
    wx.showModal({ title:'删除账本？', content:'账本中的历史记录会保留。', confirmColor:'#D85C50',
      success:result => { if (result.confirm && store.removeLedger(this.data.id)) wx.navigateBack() } })
  }
})
