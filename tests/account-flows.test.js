const assert = require('node:assert/strict')
global.wx = { getStorageSync:() => null, setStorageSync() {}, removeStorageSync() {},
  showToast() {}, navigateBack() {} }
const store = require('../store/bookkeeping')
store.reset()
function loadPage(file) {
  let definition
  global.Page = value => { definition = value }
  require('../pages/' + file + '/index')
  return { ...definition, data:structuredClone(definition.data),
    setData(value, callback) { Object.assign(this.data, value); if (callback) callback() } }
}
const originalTimeout = global.setTimeout
global.setTimeout = callback => callback()
try {
  const ledger = loadPage('ledger-edit')
  ledger.onLoad({})
  ledger.inputName({ detail:{ value:'周末小账' } })
  ledger.save()
  let state = store.getState()
  assert.equal(state.ledgers.length, 2)
  assert.equal(state.ledgers[1].name, '周末小账')
  assert.equal(state.ledgers[1].icon, undefined)
  assert.deepEqual(state.ledgers[1].categoryIds, store.expenseCategories.map(item => item.id))
  const record = loadPage('record')
  record.refreshTargets()
  assert.equal(record.data.categories.length, store.expenseCategories.length)

  const asset = loadPage('asset-edit')
  asset.onLoad({})
  assert.equal(Number(asset.data.balance), 0)
  asset.selectCategory({ currentTarget:{ dataset:{ id:'payment' } } })
  assert.equal(asset.data.name, '支付账户')
  asset.name({ detail:{ value:'我的微信零钱' } })
  asset.balance({ detail:{ value:'128.50' } })
  asset.save()
  state = store.getState()
  const saved = state.assets.at(-1)
  assert.equal(saved.categoryId, 'payment')
  assert.equal(saved.balance, 128.5)
  assert.equal(saved.name, '我的微信零钱')
  asset.onLoad({ id:saved.id })
  asset.selectCategory({ currentTarget:{ dataset:{ id:'cash' } } })
  assert.equal(asset.data.name, '我的微信零钱')
  asset.save()
  assert.equal(store.getState().assets.at(-1).categoryId, 'cash')
  assert.equal(store.getState().assets.at(-1).balance, 128.5)
  assert.equal(store.getState().assets.at(-1).color, saved.color)
} finally { global.setTimeout = originalTimeout }
console.log('Simplified ledger and asset category flows passed')
