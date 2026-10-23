/* Build three calico scenes; retain the original default profile avatar. */
const fs=require('node:fs')
const path=require('node:path')
const sharp=require('sharp')
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/doodles'),source=path.join(root,'design/handdrawn/sources')
const ink='#5b4b40',paper='#fff9eb',orange='#dca16c',dark='#75655e',rose='#dda5a1',sage='#afbd95',gold='#efd18a'
const head='M108 91 Q94 76 104 54 L101 26 L122 43 Q140 36 157 43 L180 26 L177 55 Q188 80 173 94 Q143 108 108 91Z'
const silhouette='M104 140 Q93 114 112 91 L166 91 Q189 115 177 148 Q148 160 104 149Z'
function svg(body,w=300,h=185){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g stroke="${ink}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`}
const body=`<defs><clipPath id="calico-head"><path d="${head}"/></clipPath><clipPath id="calico-body"><path d="${silhouette}"/></clipPath></defs>
  <path d="${silhouette}" fill="${paper}"/>
  <g clip-path="url(#calico-body)" stroke="none"><path d="M154 101 Q182 97 186 131 Q176 151 160 138 Q152 124 154 101Z" fill="${orange}"/><path d="M106 112 Q120 111 119 131 Q112 141 102 136Z" fill="${dark}"/></g>
  <path d="M109 98 Q91 102 97 119 Q104 124 116 116 M168 102 Q182 106 178 121 Q173 125 164 118" fill="${paper}"/>
  <path d="M113 142 Q99 140 102 153 Q115 160 130 151 M151 151 Q172 162 180 151 Q179 142 167 141" fill="${paper}"/>
  <path d="${head}" fill="${paper}"/>
  <g clip-path="url(#calico-head)" stroke="none"><path d="M98 20 L139 28 Q143 45 133 56 Q125 60 127 75 Q108 84 99 65Z" fill="${orange}"/><path d="M152 21 L188 19 L185 64 Q168 73 157 58 Q151 45 152 21Z" fill="${dark}"/></g>
  <path d="${head}" fill="none"/>
  <path d="M105 32 L116 43 M175 32 L162 44" fill="none" stroke="${rose}"/>
  <path d="M108 75 L119 77 M163 77 L178 73 M109 84 L119 81 M163 82 L177 87" fill="none"/>
  <path d="M135 74 Q141 70 147 74 L141 79Z" fill="${rose}"/><path d="M141 79 Q135 87 129 81 M141 79 Q148 87 155 81" fill="none"/>
  <path d="M112 149 L112 153 M119 149 L119 154 M163 149 L163 154 M170 148 L170 153" fill="none" stroke-width="1.2"/>`
const eyesOpen='<circle cx="126" cy="66" r="2.1" fill="'+ink+'" stroke="none"/><circle cx="156" cy="66" r="2.1" fill="'+ink+'" stroke="none"/>'
async function write(name,text,width=900){const editable=path.join(source,name+'.svg');if(!fs.existsSync(editable)||fs.readFileSync(editable,'utf8').replace(/\r\n/g,'\n')!==text.replace(/\r\n/g,'\n'))fs.writeFileSync(editable,text);const temporary=path.join(root,'design/preview/asset-build',name+'.png');fs.mkdirSync(path.dirname(temporary),{recursive:true});await sharp(Buffer.from(text)).resize({width}).png({palette:true,colours:64,dither:0,compressionLevel:9,effort:10}).toFile(temporary);fs.renameSync(temporary,path.join(out,name+'.png'))}
;(async()=>{
  fs.mkdirSync(out,{recursive:true});fs.mkdirSync(source,{recursive:true})
  const sceneArt=require('./calico-scenes.cjs'),layers=[]
  for(const [scene,art] of Object.entries(sceneArt))for(const [layer,content] of Object.entries(art)) {
    const name='calico-'+layer+'-'+scene
    await write(name,svg(content),480);layers.push(name)
  }
  await write('calico-avatar',svg('<g transform="translate(-66,-14) scale(.7)">'+body+eyesOpen+'</g>',64,64),192)
  const manifestPath=path.join(out,'manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))
  manifest.calico={identity:'miaopu-calico',markings:'orange left forehead, dark right ear, orange flank and dark-tipped tail',layers,scenes:['journal','wealth','record'],width:480,avatar:'calico-avatar',gestures:{journal:'look down and write in an open journal',wealth:'smile and hug a coin behind the treasure chest',record:'wear a camera on a neck strap, raise it and get ready to take a photo'}}
  // A standalone export from the identical vector layers, not an enlargement
  // of the small runtime PNG. Keep the large export outside the upload package.
  const exportDir=path.join(root,'design/exports');fs.mkdirSync(exportDir,{recursive:true})
  const art=sceneArt.record
  const character=art.tail+art.body+art['eyes-open']+art.foreground+art.paw
  const large=`<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="4096" viewBox="56 3 180 180"><title>喵扑记账 · 挂相机的三花猫</title><g stroke="${ink}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${character}</g></svg>`
  fs.writeFileSync(path.join(exportDir,'miaopu-camera-cat.svg'),large)
  await sharp(Buffer.from(large)).png({compressionLevel:9}).toFile(path.join(exportDir,'miaopu-camera-cat-4096.png'))
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n')
  console.log('Built three individual calico poses with foreground props and animated paws')
})().catch(error=>{console.error(error);process.exitCode=1})
