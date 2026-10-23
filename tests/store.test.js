const assert = require('node:assert/strict')

const memory = new Map()
global.wx = {
  getStorageSync: key => memory.get(key),
  setStorageSync: (key, value) => memory.set(key, value),
  removeStorageSync: key => memory.delete(key)
}

let store = require('../store/bookkeeping')

let state = store.getState()
assert.deepEqual(state.ledgers.map(item => item.name), ['日常账本'])
assert.deepEqual(state.assets.map(item => item.name), ['日常钱包'])
assert.equal(state.ledgers[0].budget, 3000)
assert.equal(state.activeLedgerId, state.ledgers[0].id)
assert.equal(state.ledgers[0].assetId, state.assets[0].id)
assert.deepEqual(state.transactions, [])
assert.ok(state.assets.every(item => item.balance === 0))
assert.deepEqual(memory.get('xiaoman-bookkeeping-v1'), state)
delete require.cache[require.resolve('../store/bookkeeping')]
store = require('../store/bookkeeping')
assert.deepEqual(store.getState(), state)

// First-launch page totals and the recording target use the same empty wallet.
function page(name) {
  let definition
  global.Page = value => { definition = value }
  require('../pages/' + name + '/index')
  return { ...definition, data:structuredClone(definition.data),
    setData(value) { Object.assign(this.data, value) } }
}
const ledgerPage = page('ledger')
ledgerPage.refresh()
assert.equal(ledgerPage.data.summary.totalExpense, '0.00')
assert.equal(ledgerPage.data.summary.totalIncome, '0.00')
assert.equal(ledgerPage.data.summary.remaining, '3000.00')
assert.equal(ledgerPage.data.groups.length, 0)
const assetsPage = page('assets')
assetsPage.refresh()
assert.equal(assetsPage.data.total, '0.00')
assert.equal(assetsPage.data.assets.length, 1)
const recordPage = page('record')
recordPage.refreshTargets()
assert.equal(recordPage.data.targets.length, 1)
assert.equal(recordPage.data.targets[0].assetId, state.assets[0].id)

const startBalance = state.assets.find(item => item.id === 'asset_daily').balance
store.addTransaction({
  type: 'expense', ledgerId: 'ledger_daily', assetId: 'asset_daily',
  categoryId: 'food', amount: 25.5, note: '测试午餐', date: '2026-09-21', photos: []
})
state = store.getState()
assert.equal(state.assets.find(item => item.id === 'asset_daily').balance, startBalance - 25.5)

store.addTransaction({
  type: 'income', ledgerId: '', assetId: 'asset_daily',
  categoryId: 'salary', amount: 100, note: '测试收入', date: '2026-09-21', photos: []
})
state = store.getState()
assert.equal(state.assets.find(item => item.id === 'asset_daily').balance, startBalance + 74.5)
assert.equal(state.transactions.length, 2)

store.saveLedger({
  name: '测试账本', icon: '🧪', monthlySummary: true, budget: 888,
  assetId: 'asset_daily', categoryIds: ['food']
})
state = store.getState()
assert.equal(state.ledgers.at(-1).name, '测试账本')
assert.equal(state.activeLedgerId, state.ledgers.at(-1).id)
assert.equal(state.ledgers.at(-1).icon, undefined)
assert.deepEqual(state.ledgers.at(-1).categoryIds, store.expenseCategories.map(item => item.id))

// A saved current-version installation is not reset to the new defaults.
store.saveAsset({ name:'已有储蓄', categoryId:'savings', balance:456.78 })
store.saveLedger({ id:'ledger_daily', budget:7200 })
state = store.getState()
delete require.cache[require.resolve('../store/bookkeeping')]
store = require('../store/bookkeeping')
assert.deepEqual(store.getState(), state)
store.reset()
state = store.getState()
assert.equal(state.ledgers.length, 1)
assert.equal(state.ledgers[0].budget, 3000)
assert.equal(state.ledgers[0].assetId, state.assets[0].id)
assert.deepEqual(state.assets.map(({name,balance}) => ({name,balance})), [{name:'日常钱包',balance:0}])
assert.deepEqual(state.transactions, [])

console.log('Store domain tests passed')
