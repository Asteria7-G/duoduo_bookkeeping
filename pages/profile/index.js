const store=require('../../store/bookkeeping')
Page({
  data:{profile:{},streak:0,ledgerCount:0,assetCount:0},
  onShow(){wx.showTabBar({animation:false});const tabBar=this.getTabBar&&this.getTabBar();if(tabBar)tabBar.setData({selected:4,hidden:false});this.refresh()},
  refresh(){const s=store.getState(),days=[...new Set(s.transactions.map(x=>x.date))].sort().reverse();let streak=0,d=new Date();for(let i=0;i<400;i++){const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');if(days.includes(key)){streak++}else if(i>0){break}d.setDate(d.getDate()-1)}this.setData({profile:s.profile,streak,ledgerCount:s.ledgers.length,assetCount:s.assets.length})},
  chooseAvatar(e){store.updateProfile({avatarUrl:e.detail.avatarUrl});this.refresh()},
  nickname(e){const nickname=e.detail.value.trim()||'微信用户';store.updateProfile({nickname});this.setData({'profile.nickname':nickname})},
  vip(){if(this.data.profile.vip)return wx.showToast({title:'你已经是哆哆会员'});wx.showModal({title:'升级哆哆会员',content:'演示版本可免费体验会员身份，后续可接入微信支付。',confirmText:'立即体验',confirmColor:'#42583E',success:r=>{if(r.confirm){store.updateProfile({vip:true});this.refresh();wx.showToast({title:'升级成功'})}}})},
  ledgers(){wx.navigateTo({url:'/pages/ledger-manage/index'})},assets(){wx.switchTab({url:'/pages/assets/index'})},settings(){wx.navigateTo({url:'/pages/settings/index'})}
})
