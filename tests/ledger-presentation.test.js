const assert = require('node:assert/strict')
global.wx = { getStorageSync: () => null, setStorageSync() {}, removeStorageSync() {} }
const store = require('../store/bookkeeping')
let definition
global.Page = value => { definition = value }
require('../pages/ledger/index')
const page = { ...definition, data: structuredClone(definition.data),
  setData(value, callback) { Object.assign(this.data, value); if (callback) callback() } }
page.onLoad()
const ledger = store.getState().ledgers[0]
page.setData({ month: '2000-02' })
store.addTransaction({ type:'expense', ledgerId:ledger.id, assetId:ledger.assetId,
  categoryId:'food', amount:137, date:'2000-02-08', note:'Test expense' })
store.addTransaction({ type:'income', assetId:ledger.assetId,
  categoryId:'salary', amount:6800, date:'2000-02-08', note:'Test income' })
page.refresh()

store.saveLedger({ id: ledger.id, budget: 100, monthlySummary: true })
page.refresh()
assert.equal(page.data.summary.totalExpense, '137.00')
assert.equal(page.data.summary.remaining, '-37.00')
assert.equal(page.data.budgetProgress, 100)
assert.equal(page.data.budgetStatus, '已超出月度预算')
assert.equal(page.data.summary.over, true)

// A tiny overspend must remain explicit even when the percentage rounds to 100.
store.saveLedger({ id: ledger.id, budget: 136.99 })
page.refresh()
assert.equal(page.data.budgetStatus, '已超出月度预算')

for (const change of [{ budget: 0 }, { budget: 5000, monthlySummary: false }]) {
  store.saveLedger({ id: ledger.id, ...change })
  page.refresh()
  assert.equal(page.data.hasBudget, false)
  assert.equal(page.data.remainingLabel, '本月结余')
  assert.equal(page.data.summary.remaining, '6663.00')
}
page.toggleHidden()
assert.equal(store.getState().settings.amountHidden, true)
page.refresh()
assert.equal(page.data.hidden, true)
page.toggleHidden()
assert.equal(store.getState().settings.amountHidden, false)

page.changeMonth({ detail: { value: '2000-01' } })
assert.equal(page.data.groups.length, 0)
assert.equal(page.data.summary.totalExpense, '0.00')
assert.equal(page.data.summary.totalIncome, '0.00')
console.log('Ledger budget, empty state and privacy tests passed')
