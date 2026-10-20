const store = require('../../store/bookkeeping')
const { presentAsset } = require('../../utils/asset-categories')
Page({
  data:{assets:[],total:'0.00',hidden:false},
  onShow(){wx.showTabBar({animation:false});const tabBar=this.getTabBar&&this.getTabBar();if(tabBar)tabBar.setData({selected:1,hidden:false});this.refresh()},
  refresh(){const s=store.getState();this.setData({assets:s.assets.map(a=>({...presentAsset(a),balanceText:a.balance.toFixed(2)})),total:s.assets.reduce((v,a)=>v+a.balance,0).toFixed(2),hidden:s.settings.amountHidden})},
  add(){wx.navigateTo({url:'/pages/asset-edit/index'})},
  edit(e){wx.navigateTo({url:`/pages/asset-edit/index?id=${e.currentTarget.dataset.id}`})},
  toggleHidden(){const hidden=!this.data.hidden;store.updateSettings({amountHidden:hidden});this.setData({hidden})}
})
