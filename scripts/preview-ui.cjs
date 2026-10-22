/* Local review only: renders real WXML/WXSS with Page data in a browser.
 * This is a visual approximation, not a WeChat runtime or release build.
 */
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const output = path.join(root, 'design', 'preview')
fs.mkdirSync(output, { recursive: true })
global.wx = {
  getStorageSync: () => null, setStorageSync() {}, removeStorageSync() {},
  showTabBar() {}, hideTabBar() {}, nextTick() {}
}
const pages = {}
function css(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').replace(/@import\s+"([^"]+)";/g,
    (_, imported) => css(path.join(path.dirname(file), imported)))
}
for (const name of ['ledger', 'assets', 'record', 'charts', 'profile', 'ledger-manage', 'ledger-edit', 'asset-edit', 'bill', 'settings']) {
  let definition
  global.Page = value => { definition = value }
  require(path.join(root, 'pages', name, 'index.js'))
  const instance = { ...definition, data: structuredClone(definition.data),
    setData(value, callback) { Object.assign(this.data, value); if (callback) callback() },
    getTabBar: () => ({ setData() {} }) }
  if (instance.onLoad) instance.onLoad({})
  if (instance.onShow) instance.onShow()
  pages[name] = { data: instance.data,
    wxml: fs.readFileSync(path.join(root, 'pages', name, 'index.wxml'), 'utf8'),
    css: css('app.wxss') + '\n' + css('pages/' + name + '/index.wxss') }
}
let tab
global.Component = value => { tab = value }
require(path.join(root, 'custom-tab-bar', 'index.js'))
const payload = { pages, incomeCategories:require('../store/bookkeeping').incomeCategories, tab: { data: tab.data, css: css('custom-tab-bar/index.wxss'),
  wxml: fs.readFileSync(path.join(root, 'custom-tab-bar/index.wxml'), 'utf8') },
  calico:{css:css('components/calico-cat/index.wxss'),wxml:fs.readFileSync(path.join(root,'components/calico-cat/index.wxml'),'utf8')},
  wordmark:{css:css('components/brand-wordmark/index.wxss').replace(/:host/g,'brand-wordmark'),wxml:fs.readFileSync(path.join(root,'components/brand-wordmark/index.wxml'),'utf8')} }
const shell = fs.readFileSync(path.join(__dirname, 'preview-shell.html'), 'utf8')
fs.writeFileSync(path.join(output, 'index.html'),
  shell.replace('/* PREVIEW_DATA */', 'const source = ' + JSON.stringify(payload).replace(/</g, '\\u003c') + ';'))
console.log('Visual preview: ' + path.join(output, 'index.html'))
