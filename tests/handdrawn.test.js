const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname,'..')
const store = require('../store/bookkeeping')
const {assetCategories,legacyAssetCategories,presentAsset} = require('../utils/asset-categories')
const pngSignature = Buffer.from([137,80,78,71,13,10,26,10])
const doodleManifest=JSON.parse(fs.readFileSync(path.join(root,'assets/doodles/manifest.json'),'utf8'))
const categories = [...store.expenseCategories,...store.incomeCategories,store.getCategory('legacy-unknown')]
assert.equal(store.expenseCategories.length,24)
assert.equal(store.incomeCategories.length,5)
assert.equal(assetCategories.length,10)
for(const item of [...categories,...assetCategories,...legacyAssetCategories]) {
  assert.match(item.iconPath,/^\/assets\/doodles\/.+\.png$/)
  const file=fs.readFileSync(path.join(root,item.iconPath))
  assert.ok(file.subarray(0,8).equals(pngSignature),item.id+' is not a PNG')
  assert.equal(file.readUInt32BE(16),doodleManifest.iconSize,item.id+' icon width')
  assert.equal(file.readUInt32BE(20),doodleManifest.iconSize,item.id+' icon height')
}
assert.equal(new Set(categories.map(x=>x.iconPath)).size,categories.length)
const illustrations=JSON.parse(fs.readFileSync(path.join(root,'assets/doodles/manifest.json'),'utf8')).illustrations
for(const name of illustrations) {
  const file=fs.readFileSync(path.join(root,'assets/doodles',name+'.png'))
  assert.ok(file.subarray(0,8).equals(pngSignature),name+' is not a PNG')
  assert.equal(file.readUInt32BE(16),900,name+' illustration width')
}
const calico=JSON.parse(fs.readFileSync(path.join(root,'assets/doodles/manifest.json'),'utf8')).calico
for(const name of [...calico.layers,calico.avatar]) {
  const file=fs.readFileSync(path.join(root,'assets/doodles',name+'.png'))
  assert.ok(file.subarray(0,8).equals(pngSignature),name+' is not a PNG')
  assert.equal(file.readUInt32BE(16),name===calico.avatar?192:calico.width)
  assert.equal(file.readUInt32BE(20),name===calico.avatar?192:Math.round(calico.width*185/300))
}
for(const layer of ['body','eyes-open','eyes-closed','foreground','paw']) {
  const hashes=calico.scenes.map(scene=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/doodles','calico-'+layer+'-'+scene+'.png'))).digest('hex'))
  assert.equal(new Set(hashes).size,3,'Each scene needs its own '+layer)
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
// Historical source images remain in the repository but not in upload packages.
const {auditPackage}=require('../scripts/check-package.cjs')
assert.ok(auditPackage(root).sourceBytes<1.5*1024*1024,'Source package exceeds 1.5 MiB')
console.log('All category/account doodles, offline handwriting font, legacy presentation and source package budget passed')
