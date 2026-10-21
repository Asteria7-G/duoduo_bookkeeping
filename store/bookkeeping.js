const storage = require('../services/storage')
const dateUtil = require('../utils/date')
const { getAssetCategory } = require('../utils/asset-categories')

const expenseCategories = [
  { id: 'food', name: '餐饮', icon: '🥗', color: '#FFE7A8' },
  { id: 'shopping', name: '购物', icon: '🛍️', color: '#F9D7E0' },
  { id: 'snack', name: '零食', icon: '🍰', color: '#E8D9F7' },
  { id: 'transport', name: '交通', icon: '🚌', color: '#CBE8F3' },
  { id: 'pet', name: '宠物', icon: '🐾', color: '#F5E3C5' },
  { id: 'fruit', name: '水果', icon: '🍒', color: '#F9D7E0' },
  { id: 'clothes', name: '服饰', icon: '👕', color: '#D3E5FA' },
  { id: 'sport', name: '运动', icon: '🏊', color: '#CBE8F3' },
  { id: 'fun', name: '娱乐', icon: '🎮', color: '#DAD6F7' },
  { id: 'home', name: '住房', icon: '🏠', color: '#D9EACB' },
  { id: 'software', name: '应用软件', icon: '📱', color: '#CDE9E0' },
  { id: 'beauty', name: '美容', icon: '🪞', color: '#F9D7E0' },
  { id: 'hotel', name: '酒店', icon: '🏨', color: '#F8D4D0' },
  { id: 'travel', name: '旅行', icon: '✈️', color: '#D3E5FA' },
  { id: 'child', name: '孩子', icon: '🧸', color: '#FFE7A8' },
  { id: 'elder', name: '长辈', icon: '🫶', color: '#E8D9F7' },
  { id: 'car', name: '汽车', icon: '🚙', color: '#CBE8F3' },
  { id: 'health', name: '医疗', icon: '🩺', color: '#F8D4D0' },
  { id: 'book', name: '书籍', icon: '📚', color: '#DAD6F7' },
  { id: 'study', name: '学习', icon: '📚', color: '#CDE9E0' },
  { id: 'lottery', name: '彩票', icon: '🎟️', color: '#F8D4D0' },
  { id: 'loss', name: '亏损', icon: '📉', color: '#FFE7A8' },
  { id: 'gift', name: '礼物', icon: '🎁', color: '#F9D7E0' },
  { id: 'office', name: '办公', icon: '📒', color: '#D9EACB' }
].map(category => ({ ...category, iconPath:'/assets/doodles/category-' + category.id + '.png' }))

const incomeCategories = [
  { id: 'salary', name: '工资', icon: '💼', color: '#CBE8D8' },
  { id: 'side', name: '副业', icon: '🌱', color: '#D9EACB' },
  { id: 'invest', name: '收益', icon: '📈', color: '#FFE7A8' },
  { id: 'bonus', name: '红包', icon: '🧧', color: '#F8D4D0' },
  { id: 'other-income', name: '其它', icon: '☀️', color: '#D3E5FA' }
].map(category => ({ ...category, iconPath:'/assets/doodles/category-' + category.id + '.png' }))

function uid(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }

function seed() {
  const today = new Date()
  const dates = [0, -1, -2].map(offset => dateUtil.formatDate(dateUtil.addDays(today, offset)))
  return {
    version: 3,
    activeLedgerId: 'ledger_daily',
    ledgers: [
      { id: 'ledger_daily', name: '日常账本', monthlySummary: true, budget: 5000, assetId: 'asset_daily', categoryIds: expenseCategories.map(item => item.id), createdAt: Date.now() }
    ],
    assets: [
      { id: 'asset_daily', name: '日常开支', categoryId:'daily', icon: '👛', balance: 0, color: '#E6EBDD' },
      { id: 'asset_saving', name: '安心储蓄', categoryId:'savings', icon: '🏦', balance: 0, color: '#EEE8D8' }
    ],
    transactions: [
      { id: 'tx_seed_1', type: 'expense', ledgerId: 'ledger_daily', assetId: 'asset_daily', categoryId: 'food', amount: 36, note: '午餐', date: dates[0], photos: [] },
      { id: 'tx_seed_2', type: 'expense', ledgerId: 'ledger_daily', assetId: 'asset_daily', categoryId: 'transport', amount: 12, note: '地铁', date: dates[0], photos: [] },
      { id: 'tx_seed_3', type: 'expense', ledgerId: 'ledger_daily', assetId: 'asset_daily', categoryId: 'shopping', amount: 89, note: '生活用品', date: dates[1], photos: [] },
      { id: 'tx_seed_4', type: 'income', ledgerId: '', assetId: 'asset_daily', categoryId: 'salary', amount: 6800, note: '工资到账', date: dates[2], photos: [] }
    ],
    profile: { nickname: '微信用户', avatarUrl: '', vip: false },
    settings: { amountHidden: false, vibration: true }
  }
}

let state = null
function clone(value) { return JSON.parse(JSON.stringify(value)) }
function init() {
  if (!state) {
    state = storage.load() || seed()
    if (!state.version || state.version < 3) {
      state.ledgers = state.ledgers.map(({ icon, ...ledger }) => ({
        ...ledger, categoryIds: expenseCategories.map(item => item.id)
      }))
      state.assets = state.assets.map(asset => ({ ...asset, categoryId:getAssetCategory(asset).id }))
      state.version = 3
      storage.save(state)
    }
  }
  return state
}
function persist() { storage.save(state) }
function getState() { return clone(init()) }

function getCategory(id) {
  return [...expenseCategories, ...incomeCategories].find(item => item.id === id) || { id, name:'其他', iconPath:'/assets/doodles/category-other.png', color:'#E6EAE8' }
}

function setActiveLedger(id) { init(); state.activeLedgerId = id; persist() }

function saveLedger(data) {
  init()
  const { icon, categoryIds, ...fields } = data
  const model = { ...fields, categoryIds:expenseCategories.map(item => item.id) }
  if (data.id) {
    const index = state.ledgers.findIndex(item => item.id === data.id)
    state.ledgers[index] = { ...state.ledgers[index], ...model }
  } else {
    const item = { ...model, id: uid('ledger'), createdAt: Date.now() }
    state.ledgers.push(item)
    state.activeLedgerId = item.id
  }
  persist()
}

function removeLedger(id) {
  init()
  if (state.ledgers.length <= 1) return false
  state.ledgers = state.ledgers.filter(item => item.id !== id)
  if (state.activeLedgerId === id) state.activeLedgerId = state.ledgers[0].id
  persist(); return true
}

function saveAsset(data) {
  init()
  const existing = data.id && state.assets.find(item => item.id === data.id)
  const merged = { ...existing, ...data }
  const category = getAssetCategory(merged)
  const model = { ...merged, categoryId:category.id, icon:category.icon, balance:Number(merged.balance) || 0 }
  if (data.id) {
    const index = state.assets.findIndex(item => item.id === data.id)
    state.assets[index] = model
  } else {
    state.assets.push({ ...model, id:uid('asset') })
  }
  persist()
}

function addTransaction(data) {
  init()
  const amount = Number(data.amount)
  const tx = { ...data, id: uid('tx'), amount, photos: data.photos || [] }
  state.transactions.unshift(tx)
  const asset = state.assets.find(item => item.id === data.assetId)
  if (asset) asset.balance += data.type === 'income' ? amount : -amount
  persist(); return tx
}

function removeTransaction(id) {
  init()
  const index = state.transactions.findIndex(item => item.id === id)
  if (index < 0) return false
  const transaction = state.transactions[index]
  // Reverse the original account, even if the ledger was rebound later.
  const asset = state.assets.find(item => item.id === transaction.assetId)
  if (asset) {
    const adjustment = transaction.type === 'income' ? -transaction.amount : transaction.amount
    asset.balance = Math.round((Number(asset.balance) + adjustment) * 100) / 100
  }
  state.transactions.splice(index, 1)
  persist()
  return true
}

function updateProfile(data) { init(); state.profile = { ...state.profile, ...data }; persist() }
function updateSettings(data) { init(); state.settings = { ...state.settings, ...data }; persist() }
function reset() { storage.clear(); state = seed(); persist() }

module.exports = {
  init, getState, setActiveLedger, saveLedger, removeLedger, saveAsset, addTransaction, removeTransaction,
  updateProfile, updateSettings, reset, getCategory, expenseCategories, incomeCategories
}
