const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname,'..')
const store = require('../store/bookkeeping')
const {assetCategories,presentAsset} = require('../utils/asset-categories')
const pngSignature = Buffer.from([137,80,78,71,13,10,26,10])
const categories = [...store.expenseCategories,...store.incomeCategories,store.getCategory('legacy-unknown')]
assert.equal(store.expenseCategories.length,24)
assert.equal(store.incomeCategories.length,5)
assert.equal(assetCategories.length,9)
for(const item of [...categories,...assetCategories]) {
  assert.match(item.iconPath,/^\/assets\/doodles\/.+\.png$/)
  const file=fs.readFileSync(path.join(root,item.iconPath))
  assert.ok(file.subarray(0,8).equals(pngSignature),item.id+' is not a PNG')
  assert.equal(file.readUInt32BE(16),192,item.id+' icon width')
  assert.equal(file.readUInt32BE(20),192,item.id+' icon height')
}
assert.equal(new Set(categories.map(x=>x.iconPath)).size,categories.length)
const illustrations=JSON.parse(fs.readFileSync(path.join(root,'assets/doodles/manifest.json'),'utf8')).illustrations
for(const name of illustrations) {
  const file=fs.readFileSync(path.join(root,'assets/doodles',name+'.png'))
  assert.ok(file.subarray(0,8).equals(pngSignature),name+' is not a PNG')
  assert.equal(file.readUInt32BE(16),900,name+' illustration width')
}
const legacy={name:'我的银行卡',icon:'旧图标',balance:123.45}
const presented=presentAsset(legacy)
assert.equal(presented.iconPath,'/assets/doodles/asset-bank-card.png')
assert.equal(presented.balance,123.45)
assert.equal(legacy.icon,'旧图标')
for(const page of ['record','ledger','charts']) {
  const wxml=fs.readFileSync(path.join(root,'pages',page,'index.wxml'),'utf8')
  assert.doesNotMatch(wxml,/\.(?:icon)\s*}}/,'Visible categories must not fall back to emoji')
}
const stylesheet=fs.readFileSync(path.join(root,'theme/handwriting.wxss'),'utf8')
const font=Buffer.from(stylesheet.match(/base64,([^"\)]+)/)[1],'base64')
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/fonts/manifest.json'),'utf8'))
assert.equal(font.subarray(0,4).toString(),'wOF2')
assert.equal(crypto.createHash('sha256').update(font).digest('hex'),manifest.sha256)
assert.ok(manifest.glyphs>7000)
assert.match(fs.readFileSync(path.join(root,'assets/fonts/OFL.txt'),'utf8'),/SIL OPEN FONT LICENSE/)
assert.doesNotMatch(stylesheet,/url\(["']?https?:/)
// Guard the source package budget: dev previews/references are excluded by project config.
function bytes(directory) {
  return fs.readdirSync(directory,{withFileTypes:true}).reduce((sum,item)=>{
    const file=path.join(directory,item.name)
    return sum+(item.isDirectory()?bytes(file):fs.statSync(file).size)
  },0)
}
const runtimeBytes=['assets','pages','store','utils','services','components','custom-tab-bar','theme']
  .reduce((sum,dir)=>sum+bytes(path.join(root,dir)),0)+['app.js','app.json','app.wxss','sitemap.json']
  .reduce((sum,file)=>sum+fs.statSync(path.join(root,file)).size,0)
assert.ok(runtimeBytes<2*1024*1024,'Runtime sources exceed 2 MiB: '+runtimeBytes)
console.log('All category/account doodles, offline handwriting font, legacy presentation and source package budget passed')
