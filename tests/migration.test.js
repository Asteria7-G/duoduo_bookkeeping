const assert = require('node:assert/strict')
let saved
global.wx = { getStorageSync:() => saved, setStorageSync:(key,value) => { saved=structuredClone(value) },
  removeStorageSync:() => { saved=null } }
const original = require('../store/bookkeeping')
original.reset()
const legacy = original.getState()
legacy.version = 2
legacy.ledgers[0].icon = '🌿'
legacy.ledgers[0].categoryIds = ['food']
for (const asset of legacy.assets) delete asset.categoryId
legacy.assets[0].icon = '🍃'
legacy.assets[1].icon = '☁️'
legacy.assets.push({ id:'asset_travel', name:'我的旅行钱', icon:'🌊', balance:7001.23, color:'#CBE8F3' })
legacy.ledgers.push({ id:'ledger_travel', name:'旅途随记', icon:'🌤️', assetId:'asset_travel',
  monthlySummary:true, budget:2000, categoryIds:['travel'] })
legacy.transactions.push({ id:'tx_custom', type:'expense', ledgerId:'ledger_travel', assetId:'asset_travel',
  categoryId:'travel', amount:88, date:'2000-01-01', photos:['saved-photo.jpg'], note:'保留我的旅行记录' })
legacy.activeLedgerId = 'ledger_travel'
saved = structuredClone(legacy)
delete require.cache[require.resolve('../store/bookkeeping')]
const store = require('../store/bookkeeping')
const state = store.getState()
assert.equal(state.version, 3)
assert.equal(state.ledgers.length, legacy.ledgers.length)
assert.equal(state.assets.length, legacy.assets.length)
assert.equal(state.activeLedgerId, legacy.activeLedgerId)
assert.deepEqual(state.transactions, legacy.transactions)
assert.deepEqual(state.assets.map(item => item.balance), legacy.assets.map(item => item.balance))
assert.deepEqual(state.assets.map(item => item.color), legacy.assets.map(item => item.color))
assert.deepEqual(state.assets.map(item => item.categoryId), ['daily','savings','travel'])
assert.ok(state.ledgers.every(item => !item.icon && item.categoryIds.length === store.expenseCategories.length))
assert.equal(saved.version, 3)
// Migration persists once; reopening does not reinterpret an explicit category.
delete require.cache[require.resolve('../store/bookkeeping')]
assert.deepEqual(require('../store/bookkeeping').getState(), state)
const { getAssetCategory } = require('../utils/asset-categories')
assert.equal(getAssetCategory({ name:'我的微信零钱' }).id, 'payment')
assert.equal(getAssetCategory({ name:'旅游基金' }).id, 'travel')
assert.equal(getAssetCategory({ name:'基金账户' }).id, 'investment')
assert.equal(getAssetCategory({ name:'我的银行卡' }).id, 'bank-card')
assert.equal(getAssetCategory({ categoryId:'emergency', name:'现金账户' }).id, 'emergency')
for(const [name,id] of [['娱乐基金','entertainment'],['教育基金','education'],['养老基金','retirement'],['住房基金','housing']]) {
  assert.equal(getAssetCategory({name}).id,id)
}
console.log('Legacy accounts, balances, photos and records preserved by migration')
