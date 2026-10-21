const assert = require('node:assert/strict')
let saved
global.wx = {
  getStorageSync:() => saved, setStorageSync:(key,value) => { saved=structuredClone(value) },
  removeStorageSync:() => { saved=null }, showToast() {}
}
const store = require('../store/bookkeeping')
store.reset()
store.saveAsset({ id:'asset_daily', balance:100 })
const expense = store.addTransaction({ type:'expense', ledgerId:'ledger_daily', assetId:'asset_daily',
  categoryId:'food', amount:12.34, date:'2000-03-11' })
const income = store.addTransaction({ type:'income', assetId:'asset_daily',
  categoryId:'salary', amount:9.87, date:'2000-03-11' })
// Rebinding a ledger must never refund a different account.
store.saveLedger({ id:'ledger_daily', assetId:'asset_saving' })
assert.equal(store.removeTransaction(expense.id), true)
assert.equal(store.getState().assets[0].balance, 109.87)
assert.equal(store.getState().assets[1].balance, 0)
const afterDelete = store.getState()
assert.equal(store.removeTransaction(expense.id), false)
assert.deepEqual(store.getState(), afterDelete)
assert.equal(store.removeTransaction(income.id), true)
assert.equal(store.getState().assets[0].balance, 100)
assert.deepEqual(saved, store.getState())

store.reset()
let definition
global.Page = value => { definition=value }
require('../pages/ledger/index')
const page = { ...definition, data:structuredClone(definition.data),
  setData(value,callback) { Object.assign(this.data,value); if(callback) callback() } }
page.setData({ month:'2000-03' })
store.saveLedger({ id:'ledger_daily', budget:50 })
const makeExpense = (amount,date='2000-03-11') => store.addTransaction({
  type:'expense', ledgerId:'ledger_daily', assetId:'asset_daily', categoryId:'food', amount,date
})
const a = makeExpense(22.25), b = makeExpense(11.15), c = makeExpense(7,'2000-03-12')
page.refresh()
assert.equal(page.data.summary.totalExpense,'40.40')
assert.equal(page.data.summary.remaining,'9.60')
function swipe(id,x,y,endX,endY) {
  page.startSwipe({ currentTarget:{ dataset:{id} }, touches:[{clientX:x,clientY:y}] })
  page.endSwipe({ currentTarget:{ dataset:{id} }, changedTouches:[{clientX:endX,clientY:endY}] })
}
swipe(b.id,200,100,194,160)
assert.equal(page.data.openSwipeId,'') // Vertical scroll.
swipe(b.id,200,100,190,102)
assert.equal(page.data.openSwipeId,'') // Ordinary tap/small movement.
swipe(b.id,200,100,110,102)
assert.equal(page.data.openSwipeId,b.id)
swipe(b.id,100,100,180,100)
assert.equal(page.data.openSwipeId,'')
swipe(a.id,200,100,110,100)
page.startSwipe({currentTarget:{dataset:{id:b.id}},touches:[{clientX:200,clientY:100}]})
assert.equal(page.data.openSwipeId,'')
page.cancelSwipe()
page.endSwipe({currentTarget:{dataset:{id:b.id}},changedTouches:[{clientX:100,clientY:100}]})
assert.equal(page.data.openSwipeId,'')
page.deleteRecord({ currentTarget:{dataset:{id:b.id}} })
assert.equal(page.data.summary.totalExpense,'29.25')
assert.equal(page.data.summary.remaining,'20.75')
assert.equal(page.data.groups.find(group=>group.date==='2000-03-11').totalText,'22.25')
assert.equal(store.getState().assets[0].balance,-29.25)
page.deleteRecord({ currentTarget:{dataset:{id:c.id}} })
assert.equal(page.data.groups.length,1)
page.deleteRecord({ currentTarget:{dataset:{id:a.id}} })
assert.equal(page.data.groups.length,0)
assert.equal(page.data.summary.totalExpense,'0.00')
assert.equal(page.data.summary.remaining,'50.00')
assert.equal(store.getState().assets[0].balance,0)
const decimalA=makeExpense(.1), decimalB=makeExpense(.2)
store.removeTransaction(decimalA.id)
store.removeTransaction(decimalB.id)
assert.equal(store.getState().assets[0].balance,0)
delete require.cache[require.resolve('../store/bookkeeping')]
assert.deepEqual(require('../store/bookkeeping').getState(),store.getState())
console.log('Swipe deletion, expense/income reversal, original account, summaries and persistence passed')
