// Exercise case-sensitive module IDs as used by the mini program runtime.
// Node's filesystem require alone can hide package or filename mismatches.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const root = path.resolve(__dirname, '..')
const config = JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'))
const ignored = config.packOptions.ignore.filter(item => item.type === 'folder').map(item => item.value)
const definitions = new Map()
const loaded = new Map()
const registrations = { pages:0, components:0, apps:0 }
const context = vm.createContext({
  console, setTimeout, clearTimeout,
  wx:{ getStorageSync:() => null, setStorageSync() {}, removeStorageSync() {} },
  App() { registrations.apps++ },
  Page() { registrations.pages++ },
  Component() { registrations.components++ }
})
function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes:true })) {
    const id = (dir ? dir + '/' : '') + entry.name
    if (ignored.some(excluded => id === excluded || id.startsWith(excluded + '/'))) continue
    if (entry.isDirectory()) walk(id)
    else if (entry.name.endsWith('.js')) {
      const source = fs.readFileSync(path.join(root, id), 'utf8')
      definitions.set(id, new vm.Script('(function(require,module,exports){\n' + source + '\n})', { filename:id }).runInContext(context))
    }
  }
}
// Restrict discovery to actual runtime roots, never test or reference sources.
for (const dir of ['services','store','utils','pages','components','custom-tab-bar']) walk(dir)
definitions.set('app.js', new vm.Script('(function(require,module,exports){\n' +
  fs.readFileSync(path.join(root, 'app.js'), 'utf8') + '\n})', { filename:'app.js' }).runInContext(context))
function load(id) {
  if (loaded.has(id)) return loaded.get(id).exports
  assert.ok(definitions.has(id), 'Missing mini program module: ' + id)
  const module = { exports:{} }
  loaded.set(id, module)
  definitions.get(id)(request => {
    assert.ok(request.startsWith('.') || request.startsWith('/'), 'Unexpected external dependency: ' + request)
    const target = request.startsWith('/') ? request.slice(1) : path.posix.join(path.posix.dirname(id), request)
    return load(target.endsWith('.js') ? target : target + '.js')
  }, module, module.exports)
  return module.exports
}
load('app.js')
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
for (const route of app.pages) load(route + '.js')
for (const id of definitions.keys()) {
  if (id.startsWith('components/') || id.startsWith('custom-tab-bar/')) load(id)
}
assert.equal(registrations.apps, 1)
assert.equal(registrations.pages, app.pages.length)
assert.equal(typeof load('services/storage.js').savePhotos, 'function')
console.log('Mini program module registration passed: ' + loaded.size + ' modules; all pages load without Node require')
