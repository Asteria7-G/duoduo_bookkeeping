// Shared by seed data, migration, account cards and the account editor.
const assetCategories = [
  { id:'daily', label:'日常钱包', defaultName:'日常开支', icon:'👛', color:'#E6EBDD', description:'日常消费与生活开支' },
  { id:'savings', label:'储蓄存款', defaultName:'安心储蓄', icon:'🏦', color:'#EEE8D8', description:'储蓄、定期与长期积累' },
  { id:'cash', label:'现金零钱', defaultName:'现金零钱', icon:'💵', color:'#E5EBDC', description:'随身现金与零钱' },
  { id:'bank-card', label:'银行卡', defaultName:'我的银行卡', icon:'💳', color:'#E0E8EB', description:'储蓄卡与银行活期账户' },
  { id:'payment', label:'支付账户', defaultName:'支付账户', icon:'📱', color:'#E2E9E2', description:'微信零钱、支付宝等账户' },
  { id:'investment', label:'投资理财', defaultName:'理财账户', icon:'📈', color:'#EBE6EE', description:'基金、股票等投资资产' },
  { id:'travel', label:'旅行基金', defaultName:'旅行基金', icon:'🧳', color:'#E1E9EC', description:'留给下一次出发的积蓄' },
  { id:'emergency', label:'应急备用', defaultName:'应急备用金', icon:'🛡️', color:'#EFE2DA', description:'应对临时需要的备用金' },
  { id:'family', label:'家庭公用', defaultName:'家庭公用', icon:'🏠', color:'#EEE8D8', description:'家人共同使用的资金' }
].map(category => ({ ...category, iconPath:'/assets/doodles/asset-' + category.id + '.png' }))

const legacyIcons = {
  '🍃':'daily', '☁️':'savings', '🌊':'travel', '🏠':'family',
  '🎓':'savings', '🧸':'family', '🌙':'emergency', '💰':'cash'
}
function getAssetCategory(asset = {}) {
  const explicit = assetCategories.find(category => category.id === asset.categoryId)
  if (explicit) return explicit
  const name = asset.name || ''
  let id
  if (/微信|支付宝|支付|余额宝/.test(name)) id = 'payment'
  else if (/现金|零钱/.test(name)) id = 'cash'
  else if (/理财|基金|股票|投资/.test(name) && !/旅行|旅游/.test(name)) id = 'investment'
  else if (/储蓄|存款|定期/.test(name)) id = 'savings'
  else if (/银行|卡/.test(name)) id = 'bank-card'
  else if (/旅行|旅游/.test(name)) id = 'travel'
  else if (/应急|备用/.test(name)) id = 'emergency'
  else if (/家庭|家用|共同/.test(name)) id = 'family'
  return assetCategories.find(category => category.id === (id || legacyIcons[asset.icon])) || assetCategories[0]
}
function presentAsset(asset) {
  const category = getAssetCategory(asset)
  return { ...asset, iconPath:category.iconPath, categoryLabel:category.label }
}
module.exports = { assetCategories, getAssetCategory, presentAsset }
