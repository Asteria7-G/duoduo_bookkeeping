const fs = require('node:fs')
const path = require('node:path')

// DevTools gives project.private.config.json precedence over project.config.json.
// Keep personal AppID/settings intact while selecting the project's debug library.
function configureWeChat(root) {
  const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))
  const project = read(path.join(root, 'project.config.json'))
  if (!/^\d+\.\d+\.\d+$/.test(project.libVersion)) throw new Error('A fixed debug libVersion is required')
  const file = path.join(root, 'project.private.config.json')
  const exists = fs.existsSync(file)
  const local = exists ? read(file) : {}
  if (!local || typeof local !== 'object' || Array.isArray(local)) throw new Error('Invalid private project configuration')
  const changed = !exists || local.libVersion !== project.libVersion
  if (changed) {
    local.libVersion = project.libVersion
    fs.writeFileSync(file, JSON.stringify(local, null, 2) + '\n', 'utf8')
  }
  return { version:project.libVersion, changed }
}

if (require.main === module) {
  const result = configureWeChat(path.resolve(__dirname, '..'))
  console.log(`WeChat debug library: ${result.version} (${result.changed ? 'local override updated' : 'already configured'}). Reopen the project and compile.`)
}

module.exports = { configureWeChat }
