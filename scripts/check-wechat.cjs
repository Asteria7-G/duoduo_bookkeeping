const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const root = path.resolve(__dirname, '..')
const compiler = process.argv[2] || 'C:/Program Files (x86)/Tencent/微信web开发者工具/resources/app.asar.unpacked/node_modules/wcc-exec'
const output = path.join(root, 'design/preview')
fs.mkdirSync(output, { recursive: true })
function find(dir, extension) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes:true }).flatMap(entry =>
    entry.isDirectory() ? find(dir + '/' + entry.name, extension) :
      entry.name.endsWith(extension) ? ['./' + dir + '/' + entry.name] : [])
}
const templates = ['pages','components','custom-tab-bar'].flatMap(dir => find(dir,'.wxml'))
const styles = ['./app.wxss', ...['pages','components','custom-tab-bar','theme'].flatMap(dir => find(dir,'.wxss'))]
for (const [exe, args] of [
  ['wcc.exe', ['-d','-o',path.join(output,'compiled-wxml.js'),...templates]],
  ['wcsc.exe', ['-o',path.join(output,'compiled-wxss.js'),...styles]]
]) {
  if (!fs.existsSync(path.join(compiler,exe))) throw new Error('WeChat compiler not found: pass its directory as the first argument')
  const result = spawnSync(path.join(compiler,exe),args,{cwd:root,encoding:'utf8',windowsHide:true})
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout)
}
console.log('WeChat compilation passed: ' + templates.length + ' WXML files, ' + styles.length + ' WXSS files')
