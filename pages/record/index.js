const store=require('../../store/bookkeeping')
const dateUtil=require('../../utils/date')
const { savePhotos } = require('../../services/storage')

Page({
  data:{type:'expense',targets:[],targetIndex:0,categories:[],selectedCategoryId:'',selectedCategory:{},detailVisible:false,amount:'0',formula:'',leftAmount:null,operator:'',note:'',date:'',dateShort:'',photos:[],canAddPhoto:true,photosSaving:false,vibration:true,keys:['1','2','3','4','5','6','7','8','9','.','0','⌫']},
  onLoad(){const date=dateUtil.formatDate(new Date());this.setData({date,dateShort:date.slice(5)})},
  onShow(){wx.hideTabBar({animation:false});let attempts=0;const hideCustom=()=>{const tabBar=this.getTabBar&&this.getTabBar();if(tabBar)tabBar.setData({selected:2,hidden:true});else if(attempts++<10)setTimeout(hideCustom,30)};hideCustom();this.refreshTargets()},
  refreshTargets(){const s=store.getState();const targets=this.data.type==='expense'?s.ledgers:s.assets;const targetIndex=Math.min(this.data.targetIndex,Math.max(0,targets.length-1));const categories=this.data.type==='expense'?store.expenseCategories:store.incomeCategories;const selectionValid=categories.some(c=>c.id===this.data.selectedCategoryId);const resetDetail=this.data.detailVisible&&!selectionValid;this.setData({targets,targetIndex,categories,vibration:s.settings.vibration,selectedCategoryId:selectionValid?this.data.selectedCategoryId:'',selectedCategory:resetDetail?{}:this.data.selectedCategory,detailVisible:resetDetail?false:this.data.detailVisible,amount:resetDetail?'0':this.data.amount})},
  setType(e){const type=e.currentTarget.dataset.type;if(type===this.data.type)return;this.setData({type,targetIndex:0,selectedCategoryId:'',selectedCategory:{},detailVisible:false,amount:'0',formula:'',leftAmount:null,operator:'',note:'',photos:[],canAddPhoto:true},()=>this.refreshTargets())},
  cancel(){wx.switchTab({url:'/pages/ledger/index'})},
  chooseTarget(e){this.setData({targetIndex:Number(e.detail.value),selectedCategoryId:''},()=>this.refreshTargets())},
  chooseCategory(e){const id=e.currentTarget.dataset.id;const selectedCategory=this.data.categories.find(item=>item.id===id);if(!selectedCategory)return;this.setData({selectedCategoryId:id,selectedCategory,detailVisible:true,amount:'0',formula:'',leftAmount:null,operator:''})},
  closeDetail(){if(this.data.photosSaving)return wx.showToast({title:'照片保存中，请稍候',icon:'none'});this.setData({detailVisible:false,amount:'0',formula:'',leftAmount:null,operator:'',note:'',photos:[],canAddPhoto:true})},
  inputNote(e){this.setData({note:e.detail.value})},changeDate(e){const date=e.detail.value;this.setData({date,dateShort:date.slice(5)})},
  keyTap(e){const key=e.currentTarget.dataset.key;let amount=this.data.amount;if(key==='+'||key==='-'){let left=Number(amount)||0;if(this.data.operator&&this.data.leftAmount!==null){left=this.data.operator==='+'?this.data.leftAmount+left:this.data.leftAmount-left}if(this.data.vibration)wx.vibrateShort({type:'light'});this.setData({leftAmount:left,operator:key,formula:`${Number(left.toFixed(2))} ${key}`,amount:'0'});return}if(key==='⌫'){amount=amount.length>1?amount.slice(0,-1):'0'}else if(key==='.'){if(!amount.includes('.'))amount+='.'}else{if(amount.includes('.')&&amount.split('.')[1].length>=2)return;amount=amount==='0'?key:amount+key}if(this.data.vibration)wx.vibrateShort({type:'light'});this.setData({amount})},
  resolveAmount(){const current=Number(this.data.amount)||0;if(!this.data.operator||this.data.leftAmount===null)return current;return this.data.operator==='+'?this.data.leftAmount+current:this.data.leftAmount-current},
  choosePhoto() {
    if (this.data.photosSaving || !this.data.canAddPhoto) return
    this.setData({ photosSaving:true })
    wx.chooseMedia({
      count:3 - this.data.photos.length, mediaType:['image'],
      sourceType:['album','camera'], sizeType:['compressed'], camera:'back',
      success:result => {
        return savePhotos((result.tempFiles || []).slice(0, 3 - this.data.photos.length)).then(saved => {
          const photos = this.data.photos.concat(saved.photos)
          this.setData({ photos, canAddPhoto:photos.length < 3, photosSaving:false })
          if (saved.failed) wx.showToast({ title:'部分照片未能保存，请重新添加', icon:'none' })
        }, () => {
          this.setData({ photosSaving:false })
          wx.showToast({ title:'照片未能保存，请重新添加', icon:'none' })
        })
      },
      fail:error => {
        this.setData({ photosSaving:false })
        const message = error.errMsg || ''
        if (/cancel/i.test(message)) return
        wx.showToast({
          title:/privacy/i.test(message) ? '请先同意隐私授权后再添加照片' : '无法打开相机或相册，请检查微信权限',
          icon:'none'
        })
      }
    })
  },
  preview(e){wx.previewImage({urls:this.data.photos,current:e.currentTarget.dataset.url})},removePhoto(e){if(this.data.photosSaving)return;const photos=this.data.photos.filter((_,i)=>i!==Number(e.currentTarget.dataset.index));this.setData({photos,canAddPhoto:photos.length<3})},
  finish(){
    if(this.data.photosSaving)return wx.showToast({title:'照片保存中，请稍候',icon:'none'});
    const amount=this.resolveAmount();if(amount<=0)return wx.showToast({title:'金额需要大于 0',icon:'none'});if(!this.data.selectedCategoryId)return wx.showToast({title:'请选择分类',icon:'none'})
    const target=this.data.targets[this.data.targetIndex];if(!target)return wx.showToast({title:'请先创建账户',icon:'none'})
    const s=store.getState();let ledgerId='',assetId='';if(this.data.type==='expense'){ledgerId=target.id;assetId=target.assetId}else{assetId=target.id}
    store.addTransaction({type:this.data.type,ledgerId,assetId,categoryId:this.data.selectedCategoryId,amount,note:this.data.note.trim(),date:this.data.date,photos:this.data.photos})
    wx.showToast({title:'记好啦 ✓'});this.setData({detailVisible:false,amount:'0',formula:'',leftAmount:null,operator:'',note:'',photos:[],canAddPhoto:true});setTimeout(()=>wx.switchTab({url:'/pages/ledger/index'}),500)
  }
})
