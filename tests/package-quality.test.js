const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const {auditPackage}=require('../scripts/check-package.cjs')
const root=path.resolve(__dirname,'..'),report=auditPackage(root)
const included=new Set(report.files.map(file=>file.path))
const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
assert.ok(report.sourceBytes<1.5*1024*1024,'Source package exceeds 1.5 MiB: '+report.sourceBytes)
assert.ok(report.mediaBytes<200*1024,'Combined image/audio resources exceed 200 KiB: '+report.mediaBytes)
assert.equal(app.lazyCodeLoading,'requiredComponents')
assert.deepEqual(app.usingComponents || {},{},'Only load custom components on pages that use them')
const custom=new Set(['app-tab-bar','calico-cat','brand-wordmark','progress-bar'])
let navigation
global.Component=definition=>{navigation=definition.data.items}
require('../custom-tab-bar/index')
for(const route of app.pages) {
  const json=JSON.parse(fs.readFileSync(path.join(root,route+'.json'),'utf8'))
  const wxml=fs.readFileSync(path.join(root,route+'.wxml'),'utf8')
  const used=[...new Set([...wxml.matchAll(/<([\w-]+)\b/g)].map(match=>match[1]).filter(tag=>custom.has(tag)))].sort()
  assert.deepEqual(Object.keys(json.usingComponents || {}).sort(),used,'Missing or unused page components: '+route)
  for(const component of Object.values(json.usingComponents || {})) {
    const base=component.startsWith('/')?component.slice(1):path.posix.join(path.posix.dirname(route),component)
    for(const ext of ['.js','.json','.wxml','.wxss'])assert.ok(included.has(base+ext),'Component not in package: '+base+ext)
  }
}
// Every literal and data-driven runtime image must still be in the package.
function checkReferences(dir) {
  for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})) {
    const id=dir+'/'+entry.name
    if(entry.isDirectory())checkReferences(id)
    else if(/\.(?:wxml|js|wxss)$/.test(id)) {
      const text=fs.readFileSync(path.join(root,id),'utf8')
      for(const match of text.matchAll(/\/assets\/[\w/{}.-]+\.(?:png|jpe?g|webp|gif)/g)) {
        const expanded=match[0].includes('{{scene}}')?['journal','wealth','record'].map(scene=>match[0].replace('{{scene}}',scene)):
          match[0].includes('{{item.glyph}}')?navigation.filter(item=>item.glyph).map(item=>match[0].replace('{{item.glyph}}',item.glyph)):[match[0]]
        for(const url of expanded)assert.ok(included.has(url.slice(1)),'Referenced image excluded: '+url)
      }
    }
  }
}
for(const dir of ['pages','components','custom-tab-bar','utils','store'])checkReferences(dir)
const {assetCategories,legacyAssetCategories}=require('../utils/asset-categories')
const store=require('../store/bookkeeping')
for(const item of [...assetCategories,...legacyAssetCategories,...store.expenseCategories,...store.incomeCategories]) {
  assert.ok(included.has(item.iconPath.slice(1)),'Data-driven image excluded: '+item.iconPath)
}
assert.ok(![...included].some(file=>file.startsWith('assets/brand/')))
console.log(`Package quality passed: ${report.sourceBytes} source bytes, ${report.mediaBytes} combined media bytes; page-local lazy components and runtime image dependencies intact`)
