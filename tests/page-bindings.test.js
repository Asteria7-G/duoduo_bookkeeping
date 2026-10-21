const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

global.wx = {
  getStorageSync: () => null,
  setStorageSync: () => {},
  removeStorageSync: () => {}
}

const appConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'))

for (const route of appConfig.pages) {
  let definition
  global.Page = value => { definition = value }
  require(path.join(__dirname, '..', `${route}.js`))
  assert.ok(definition, `${route} did not register a Page`)

  const wxml = fs.readFileSync(path.join(__dirname, '..', `${route}.wxml`), 'utf8')
  const eventPattern = /(?:bind|catch)(?:tap|change|input|blur|focus|confirm|nicknamereview|chooseavatar|touchstart|touchend|touchcancel)="([A-Za-z_$][\w$]*)"/g
  for (const match of wxml.matchAll(eventPattern)) {
    assert.equal(typeof definition[match[1]], 'function', `${route} is missing handler ${match[1]}`)
  }
}

console.log('Page registration and WXML binding tests passed')
