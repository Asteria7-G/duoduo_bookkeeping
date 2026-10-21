const assert = require('node:assert/strict')
global.wx = { getStorageSync:() => null, setStorageSync() {}, removeStorageSync() {},
  showToast() {}, navigateBack() {} }
const store = require('../store/bookkeeping')
store.reset()
function loadPage(file) {
  let definition
  global.Page = value => { definition = value }
  delete require.cache[require.resolve('../pages/' + file + '/index')]
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
  assert.ok(!asset.data.categories.some(item => ['cash','bank-card','payment'].includes(item.id)))
  for (const [id, name] of [['entertainment','娱乐小金库'],['education','教育基金'],['retirement','养老基金'],['housing','住房基金']]) {
    const fund = loadPage('asset-edit')
    fund.onLoad({})
    fund.selectCategory({ currentTarget:{ dataset:{ id } } })
    assert.equal(fund.data.name, name)
    fund.save()
    assert.equal(store.getState().assets.at(-1).categoryId, id)
    assert.equal(store.getState().assets.at(-1).balance, 0)
  }
  asset.selectCategory({ currentTarget:{ dataset:{ id:'education' } } })
  assert.equal(asset.data.name, '教育基金')
  asset.name({ detail:{ value:'我的进修计划' } })
  asset.balance({ detail:{ value:'128.50' } })
  asset.save()
  state = store.getState()
  const saved = state.assets.at(-1)
  assert.equal(saved.categoryId, 'education')
  assert.equal(saved.balance, 128.5)
  assert.equal(saved.name, '我的进修计划')
  asset.onLoad({ id:saved.id })
  asset.selectCategory({ currentTarget:{ dataset:{ id:'retirement' } } })
  assert.equal(asset.data.name, '我的进修计划')
  asset.save()
  assert.equal(store.getState().assets.at(-1).categoryId, 'retirement')
  assert.equal(store.getState().assets.at(-1).balance, 128.5)
  assert.equal(store.getState().assets.at(-1).color, saved.color)
  for (const id of ['cash','bank-card','payment']) {
    store.saveAsset({name:'已有账户', categoryId:id, balance:52.34, color:'#abcdef'})
    const existing = store.getState().assets.at(-1)
    const editor = loadPage('asset-edit')
    editor.onLoad({id:existing.id})
    assert.equal(editor.data.selectedCategory.id,id)
    assert.ok(editor.data.categories.some(category => category.id===id))
    editor.save()
    assert.deepEqual(store.getState().assets.at(-1), existing)
    assert.ok(!loadPage('asset-edit').data.categories.some(category => category.id===id))
  }
} finally { global.setTimeout = originalTimeout }
console.log('Simplified ledger and asset category flows passed')
