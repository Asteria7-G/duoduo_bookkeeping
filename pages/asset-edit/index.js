const store = require('../../store/bookkeeping')
const { assetCategories, getAssetCategory } = require('../../utils/asset-categories')
const baseColors = [...new Set(assetCategories.map(category => category.color))]
Page({
  data: { id:'', name:'', balance:'0', categories:assetCategories, selectedCategory:assetCategories[0],
    colors:baseColors, colorIndex:0, colorCustomized:false },
  onLoad(options = {}) {
    const asset = options.id && store.getState().assets.find(item => item.id === options.id)
    if (!asset) return
    const selectedCategory = getAssetCategory(asset)
    const categories = assetCategories.some(category => category.id === selectedCategory.id)
      ? assetCategories : [...assetCategories, selectedCategory]
    const colors = [...new Set([...baseColors, asset.color, selectedCategory.color].filter(Boolean))]
    this.setData({ id:asset.id, name:asset.name, balance:asset.balance,
      selectedCategory, categories, colors, colorIndex:Math.max(0, colors.indexOf(asset.color)), colorCustomized:true })
  },
  back() { wx.navigateBack() },
  name(event) { this.setData({ name:event.detail.value }) },
  balance(event) { this.setData({ balance:event.detail.value }) },
  selectCategory(event) {
    const category = this.data.categories.find(item => item.id === event.currentTarget.dataset.id)
    if (!category) return
    const name = !this.data.name.trim() || this.data.name === this.data.selectedCategory.defaultName
      ? category.defaultName : this.data.name
    this.setData({ selectedCategory:category, name,
      colorIndex:this.data.colorCustomized ? this.data.colorIndex : this.data.colors.indexOf(category.color) })
  },
  pickColor(event) { this.setData({ colorIndex:Number(event.currentTarget.dataset.index), colorCustomized:true }) },
  save() {
    const name = this.data.name.trim()
    if (!name) return wx.showToast({ title:'请填写资产名称', icon:'none' })
    store.saveAsset({ id:this.data.id, name, balance:Number(this.data.balance) || 0,
      categoryId:this.data.selectedCategory.id, icon:this.data.selectedCategory.icon, color:this.data.colors[this.data.colorIndex] })
    wx.showToast({ title:'已保存' })
    setTimeout(() => wx.navigateBack(), 400)
  }
})
