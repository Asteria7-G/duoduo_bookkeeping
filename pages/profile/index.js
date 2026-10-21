const store=require('../../store/bookkeeping')
const {savePhotos}=require('../../services/storage')
const hasNickname=profile=>!!(profile.nickname && profile.nickname!=='微信用户')
Page({
  data:{profile:{},streak:0,ledgerCount:0,assetCount:0,nicknameDraft:'',nicknameFocus:false,avatarSaving:false},
  onShow(){wx.hideTabBar({animation:false});this.refresh()},
  refresh(){const s=store.getState(),days=[...new Set(s.transactions.map(x=>x.date))].sort().reverse();let streak=0,d=new Date();for(let i=0;i<400;i++){const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');if(days.includes(key)){streak++}else if(i>0){break}d.setDate(d.getDate()-1)}const patch={profile:s.profile,streak,ledgerCount:s.ledgers.length,assetCount:s.assets.length};if(!this.data.nicknameFocus)patch.nicknameDraft=hasNickname(s.profile)?s.profile.nickname:'';this.setData(patch)},
  chooseAvatar(e){
    const avatarUrl=e.detail && e.detail.avatarUrl
    if(this.data.avatarSaving || typeof avatarUrl!=='string' || !avatarUrl)return
    this.setData({avatarSaving:true})
    return savePhotos([{tempFilePath:avatarUrl}]).then(result=>{
      this.setData({avatarSaving:false})
      if(!result.photos.length)return wx.showToast({title:'头像保存失败，请重新选择',icon:'none'})
      store.updateProfile({avatarUrl:result.photos[0]});this.refresh()
      if(!hasNickname(this.data.profile))this.setData({nicknameFocus:true})
    },()=>{this.setData({avatarSaving:false});wx.showToast({title:'头像保存失败，请重新选择',icon:'none'})})
  },
  focusNickname(){this.setData({nicknameFocus:true})},
  inputNickname(e){this._pendingNickname=String(e.detail.value || '').trim();this._reviewedNickname=null;this.setData({nicknameDraft:e.detail.value || ''})},
  nickname(e){
    const value=String(e.detail.value===undefined?this.data.nicknameDraft:e.detail.value).trim()
    this._pendingNickname=value
    this.setData({nicknameFocus:false})
    if(!value){this._pendingNickname=null;this.setData({nicknameDraft:hasNickname(this.data.profile)?this.data.profile.nickname:''});return}
    this.setData({nicknameDraft:value})
    if(typeof wx.canIUse==='function' && wx.canIUse('input.bindnicknamereview') && this._reviewedNickname!==value)return
    this.saveNickname(value)
  },
  nicknameReview(e){
    const value=this._pendingNickname
    if(!value)return
    if(e.detail.pass){this._reviewedNickname=value;this.saveNickname(value)}
    else{this._pendingNickname=null;this._reviewedNickname=null;this.setData({nicknameDraft:hasNickname(this.data.profile)?this.data.profile.nickname:''});wx.showToast({title:'昵称未通过校验，请重新填写',icon:'none'})}
  },
  saveNickname(nickname){store.updateProfile({nickname});this.setData({profile:store.getState().profile,nicknameDraft:nickname})},
  vip(){if(this.data.profile.vip)return wx.showToast({title:'你已经是哆哆会员'});wx.showModal({title:'升级哆哆会员',content:'演示版本可免费体验会员身份，后续可接入微信支付。',confirmText:'立即体验',confirmColor:'#42583E',success:r=>{if(r.confirm){store.updateProfile({vip:true});this.refresh();wx.showToast({title:'升级成功'})}}})},
  ledgers(){wx.navigateTo({url:'/pages/ledger-manage/index'})},assets(){wx.switchTab({url:'/pages/assets/index'})},settings(){wx.navigateTo({url:'/pages/settings/index'})}
})
