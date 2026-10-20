const assert = require('node:assert/strict')
let saved
const notifications = []
const previews = []
let mediaOptions
const fileRequests = []
global.wx = {
  getStorageSync:() => saved, setStorageSync:(key,value) => { saved=structuredClone(value) },
  removeStorageSync:() => { saved=null },
  chooseMedia:options => { mediaOptions=options },
  getFileSystemManager:() => ({ saveFile:options => fileRequests.push(options) }),
  showToast:options => notifications.push(options), switchTab() {},
  previewImage:options => previews.push(options)
}
const store = require('../store/bookkeeping')
store.reset()
function loadPage(name) {
  let definition
  global.Page = value => { definition=value }
  require('../pages/' + name + '/index')
  return { ...definition, data:structuredClone(definition.data),
    setData(value, callback) { Object.assign(this.data,value); if (callback) callback() } }
}
;(async () => {
  const record = loadPage('record')
  record.onLoad()
  record.refreshTargets()
  record.chooseCategory({ currentTarget:{ dataset:{ id:'food' } } })
  record.setData({ amount:'28.50', note:'拍照留一份收据' })
  const initialCount = store.getState().transactions.length
  record.choosePhoto()
  assert.equal(record.data.photosSaving, true)
  assert.deepEqual(mediaOptions.sourceType, ['album','camera'])
  assert.deepEqual(mediaOptions.mediaType, ['image'])
  assert.equal(mediaOptions.count, 3)
  const pending = mediaOptions.success({ tempFiles:[{ tempFilePath:'tmp/receipt-a.jpg' },{ tempFilePath:'tmp/receipt-b.jpg' }] })
  record.finish()
  assert.equal(store.getState().transactions.length, initialCount)
  // Completing saves out of order must not change gallery order.
  fileRequests[1].success({ savedFilePath:'wxfile://saved/receipt-b.jpg' })
  fileRequests[0].success({ savedFilePath:'wxfile://saved/receipt-a.jpg' })
  await pending
  assert.equal(record.data.photosSaving, false)
  assert.deepEqual(record.data.photos, ['wxfile://saved/receipt-a.jpg','wxfile://saved/receipt-b.jpg'])
  const originalTimeout = global.setTimeout
  global.setTimeout = callback => callback()
  try { record.finish() } finally { global.setTimeout=originalTimeout }
  const tx = store.getState().transactions[0]
  assert.equal(tx.amount, 28.5)
  assert.deepEqual(tx.photos, ['wxfile://saved/receipt-a.jpg','wxfile://saved/receipt-b.jpg'])

  const ledger = loadPage('ledger')
  ledger.onLoad()
  ledger.refresh()
  const row = ledger.data.groups.reduce((items,group) => items.concat(group.items),[]).find(item => item.id === tx.id)
  assert.deepEqual(row.photos, tx.photos)
  ledger.previewPhotos({ currentTarget:{ dataset:{ id:tx.id, index:'1' } } })
  assert.deepEqual(previews[0].urls, tx.photos)
  assert.equal(previews[0].current, tx.photos[1])
  ledger.previewPhotos({ currentTarget:{ dataset:{ id:'missing-transaction', index:0 } } })
  assert.equal(previews.length, 1)

  record.choosePhoto()
  const failedSave = mediaOptions.success({ tempFiles:[{ tempFilePath:'tmp/expired.jpg' }] })
  fileRequests.at(-1).fail({ errMsg:'saveFile:fail quota exceeded' })
  await failedSave
  assert.deepEqual(record.data.photos, [])
  assert.equal(record.data.photosSaving, false)
  assert.ok(!record.data.photos.includes('tmp/expired.jpg'))
  const beforeCancel = notifications.length
  record.choosePhoto()
  mediaOptions.fail({ errMsg:'chooseMedia:fail cancel' })
  assert.equal(record.data.photosSaving, false)
  assert.equal(notifications.length, beforeCancel)
  record.choosePhoto()
  mediaOptions.fail({ errMsg:'chooseMedia:fail privacy permission is not authorized' })
  assert.equal(record.data.photosSaving, false)
  assert.match(notifications.at(-1).title, /隐私授权/)
  record.setData({ photos:tx.photos, canAddPhoto:true })
  record.choosePhoto()
  assert.equal(mediaOptions.count, 1)
  const lastSave = mediaOptions.success({ tempFiles:[{ tempFilePath:'tmp/third.jpg' }] })
  fileRequests.at(-1).success({ savedFilePath:'wxfile://saved/third.jpg' })
  await lastSave
  assert.equal(record.data.photos.length, 3)
  assert.equal(record.data.canAddPhoto, false)
  record.removePhoto({ currentTarget:{ dataset:{ index:'1' } } })
  assert.equal(record.data.photos.length, 2)
  assert.equal(record.data.canAddPhoto, true)
  delete require.cache[require.resolve('../store/bookkeeping')]
  assert.deepEqual(require('../store/bookkeeping').getState().transactions[0].photos, tx.photos)
  console.log('Camera selection, persistent photo saving, record gallery and failure handling passed')
})().catch(error => { console.error(error); process.exitCode=1 })
