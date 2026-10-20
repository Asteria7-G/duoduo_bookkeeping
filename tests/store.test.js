const assert = require('node:assert/strict')

const memory = new Map()
global.wx = {
  getStorageSync: key => memory.get(key),
  setStorageSync: (key, value) => memory.set(key, value),
  removeStorageSync: key => memory.delete(key)
}

const store = require('../store/bookkeeping')
store.reset()

let state = store.getState()
assert.deepEqual(state.ledgers.map(item => item.name), ['日常账本'])
assert.deepEqual(state.assets.map(item => item.name), ['日常开支', '安心储蓄'])
assert.ok(state.assets.every(item => item.balance === 0))
for (const tx of state.transactions) {
  assert.ok(!tx.ledgerId || state.ledgers.some(ledger => ledger.id === tx.ledgerId))
  assert.ok(state.assets.some(asset => asset.id === tx.assetId))
}

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
assert.equal(state.transactions.length, 6)

store.saveLedger({
  name: '测试账本', icon: '🧪', monthlySummary: true, budget: 888,
  assetId: 'asset_daily', categoryIds: ['food']
})
state = store.getState()
assert.equal(state.ledgers.at(-1).name, '测试账本')
assert.equal(state.activeLedgerId, state.ledgers.at(-1).id)
assert.equal(state.ledgers.at(-1).icon, undefined)
assert.deepEqual(state.ledgers.at(-1).categoryIds, store.expenseCategories.map(item => item.id))

console.log('Store domain tests passed')
