const store = require('../../store/bookkeeping')
const dateUtil = require('../../utils/date')

Page({
  data: { month: '', monthText: '', ledger: {}, summary: {}, groups: [], hidden: false, hasBudget: false, budgetProgress: 0, budgetStatus: '', remainingLabel: '本月结余' },
  onLoad() { this.setData({ month: dateUtil.monthKey(new Date()) }) },
  onShow() {
    wx.showTabBar({ animation: false })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0, hidden: false })
    this.refresh()
  },
  refresh() {
    const state = store.getState()
    const ledger = state.ledgers.find(item => item.id === state.activeLedgerId) || state.ledgers[0]
    const month = this.data.month || dateUtil.monthKey(new Date())
    const expense = state.transactions.filter(item => item.type === 'expense' && item.ledgerId === ledger.id && item.date.startsWith(month))
    const income = state.transactions.filter(item => item.type === 'income' && item.assetId === ledger.assetId && item.date.startsWith(month))
    const totalExpense = expense.reduce((sum, item) => sum + item.amount, 0)
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
    const hasBudget = ledger.monthlySummary && Number(ledger.budget) > 0
    const budgetPercent = hasBudget ? Math.round(totalExpense / Number(ledger.budget) * 100) : 0
    const remaining = ledger.monthlySummary && Number(ledger.budget) > 0 ? Number(ledger.budget) - totalExpense : totalIncome - totalExpense
    const byDate = {}
    expense.forEach(item => { (byDate[item.date] ||= []).push({
      ...item, photos:Array.isArray(item.photos) ? item.photos.filter(photo => typeof photo === 'string' && photo.trim()) : [],
      amountText:item.amount.toFixed(2), category:store.getCategory(item.categoryId)
    }) })
    const groups = Object.keys(byDate).sort().reverse().map(date => ({
      date,
      label: `${Number(date.slice(5, 7))}月${Number(date.slice(8, 10))}日`,
      weekday: dateUtil.weekday(date),
      total: byDate[date].reduce((sum, item) => sum + item.amount, 0),
      totalText: byDate[date].reduce((sum, item) => sum + item.amount, 0).toFixed(2),
      items: byDate[date]
    }))
    this.setData({
      ledger, groups, hidden: state.settings.amountHidden,
      hasBudget, budgetProgress: Math.min(100, Math.max(0, budgetPercent)),
      budgetStatus: hasBudget && totalExpense > Number(ledger.budget) ? '已超出月度预算' : `已使用 ${budgetPercent}%`,
      remainingLabel: hasBudget ? '预算剩余' : '本月结余',
      budgetLabel: ledger.monthlySummary && Number(ledger.budget) > 0 ? `预算 ¥${ledger.budget}` : '收支结余',
      monthText: `${month.slice(0, 4)}年 ${Number(month.slice(5))}月`,
      summary: { totalExpense: totalExpense.toFixed(2), totalIncome: totalIncome.toFixed(2), remaining: remaining.toFixed(2), over: remaining < 0 }
    })
  },
  changeMonth(event) { this.setData({ month: event.detail.value }, () => this.refresh()) },
  toggleHidden() {
    const hidden = !this.data.hidden
    store.updateSettings({ amountHidden: hidden })
    this.setData({ hidden })
  },
  previewPhotos(event) {
    const { id, index } = event.currentTarget.dataset
    const transaction = store.getState().transactions.find(item => item.id === id)
    const urls = transaction && Array.isArray(transaction.photos)
      ? transaction.photos.filter(photo => typeof photo === 'string' && photo.trim()) : []
    if (!urls.length) return
    wx.previewImage({
      urls, current:urls[Number(index)] || urls[0],
      fail:() => wx.showToast({ title:'图片暂时无法打开，请稍后重试', icon:'none' })
    })
  },
  openLedgers() { wx.navigateTo({ url: '/pages/ledger-manage/index' }) },
  openBill() { wx.navigateTo({ url: '/pages/bill/index' }) },
  goRecord() { wx.switchTab({ url: '/pages/record/index' }) }
})
