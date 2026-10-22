const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root=path.resolve(__dirname,'..')
let hides=0
global.wx={
  getStorageSync:()=>null,setStorageSync(){},removeStorageSync(){},nextTick(){},
  hideTabBar(){hides++},
  showTabBar(){throw new Error('Native tab bar must stay hidden')}
}
const config=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
assert.equal(config.tabBar.custom,false)
assert.equal(config.lazyCodeLoading,'requiredComponents')
assert.deepEqual(config.usingComponents || {},{})
const indexes={ledger:0,assets:1,record:2,charts:3,profile:4}
for(const [name,index] of Object.entries(indexes)) {
  let definition
  global.Page=value=>{definition=value}
  require('../pages/'+name+'/index')
  const page={...definition,data:structuredClone(definition.data),
    setData(value,callback){Object.assign(this.data,value);if(callback)callback()},
    getTabBar(){throw new Error('Navigation should not depend on an auto-mounted tab bar')}
  }
  if(page.onLoad)page.onLoad({})
  page.onShow()
  const markup=fs.readFileSync(path.join(root,'pages',name,'index.wxml'),'utf8')
  const pageConfig=JSON.parse(fs.readFileSync(path.join(root,'pages',name,'index.json'),'utf8'))
  if(name!=='record')assert.equal(pageConfig.usingComponents['app-tab-bar'],'/custom-tab-bar/index')
  const bars=[...markup.matchAll(/<app-tab-bar\s+selected="(\d+)"/g)]
  assert.equal(bars.length,name==='record'?0:1)
  if(bars.length)assert.equal(Number(bars[0][1]),index)
}
assert.equal(hides,5)
console.log('All main pages hide native tabs and mount exactly one intended floating menu')
