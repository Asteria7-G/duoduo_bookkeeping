Component({
  properties: {
    selected: { type:Number, value:0 },
    hidden: { type:Boolean, value:false }
  },
  data: {
    items: [
      { text: '账本', glyph: 'ledger', pagePath: '/pages/ledger/index' },
      { text: '资产', glyph: 'wallet', pagePath: '/pages/assets/index' },
      { text: '记账', icon: '＋', pagePath: '/pages/record/index', primary: true },
      { text: '图表', glyph: 'chart', pagePath: '/pages/charts/index' },
      { text: '我的', glyph: 'cat', pagePath: '/pages/profile/index' }
    ]
  },
  methods: {
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset
      if (index === this.data.selected) return
      wx.switchTab({ url: path })
    }
  }
})
