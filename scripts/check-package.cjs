const fs=require('node:fs')
const path=require('node:path')
const mediaExtensions=new Set(['.jpg','.jpeg','.png','.svg','.webp','.gif','.flac','.m4a','.ogg','.ape','.amr','.wma','.wav','.mp3','.mp4','.aac','.aiff','.caf'])

// Conservative source inventory, not a substitute for WeChat's compiled-package
// report. Count root documentation too, but omit tool config and hidden files.
function auditPackage(root) {
  const project=JSON.parse(fs.readFileSync(path.join(root,'project.config.json'),'utf8'))
  const ignore=project.packOptions?.ignore || []
  if(project.packOptions?.include?.length)throw Error('Explicit package includes need to be accounted for before auditing')
  if(ignore.some(item=>!['file','folder'].includes(item.type)))throw Error('Unsupported package ignore rule')
  const excluded=id=>ignore.some(item=>item.type==='folder'?(id===item.value || id.startsWith(item.value+'/')):id===item.value)
  const files=[]
  function walk(dir='') {
    for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})) {
      const id=(dir?dir+'/':'')+entry.name
      if(entry.name.startsWith('.') || /^project(?:\.private)?\.config\.json$/.test(id) || excluded(id))continue
      if(entry.isSymbolicLink())throw Error('Cannot audit symlink: '+id)
      if(entry.isDirectory())walk(id)
      else files.push({path:id,bytes:fs.statSync(path.join(root,id)).size})
    }
  }
  walk()
  const media=files.filter(file=>mediaExtensions.has(path.extname(file.path).toLowerCase()))
  return {files,media,sourceBytes:files.reduce((sum,file)=>sum+file.bytes,0),mediaBytes:media.reduce((sum,file)=>sum+file.bytes,0)}
}
if(require.main===module) {
  const root=path.resolve(__dirname,'..'),report=auditPackage(root)
  const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
  console.log(JSON.stringify({sourceBytes:report.sourceBytes,sourceMiB:Number((report.sourceBytes/1024/1024).toFixed(3)),
    mediaBytes:report.mediaBytes,mediaKiB:Number((report.mediaBytes/1024).toFixed(1)),mediaFiles:report.media.length,
    lazyCodeLoading:app.lazyCodeLoading,compiledPackageRequiresDevToolsCheck:true},null,2))
  if(report.sourceBytes>=1.5*1024*1024 || report.mediaBytes>=200*1024 || app.lazyCodeLoading!=='requiredComponents')process.exitCode=1
}
module.exports={auditPackage}
