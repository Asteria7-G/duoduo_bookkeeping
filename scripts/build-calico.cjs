/* One calico character, shared layers and three lightweight animated scenes. */
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
const eyesClosed='<path d="M122 67 Q126 62 130 67 M152 67 Q156 62 160 67" fill="none"/>'
const tail=`<path d="M174 139 Q202 157 206 132 Q209 115 196 114 Q185 114 191 125" fill="none" stroke="${ink}" stroke-width="9"/><path d="M174 139 Q202 157 206 132 Q209 115 196 114 Q185 114 191 125" fill="none" stroke="${orange}" stroke-width="5"/><path d="M197 114 Q185 114 191 125" fill="none" stroke="${dark}" stroke-width="5"/>`
const baseline='<path d="M17 165 Q148 158 286 165" fill="none"/>'
const journal=baseline+`<path d="M23 143 L82 143 L82 159 L22 159Z" fill="${sage}"/><path d="M27 129 L89 131 L86 144 L23 143Z" fill="${rose}"/><path d="M30 117 L81 116 L87 130 L24 130Z" fill="${gold}"/>
  <path d="M213 122 Q228 116 243 123 Q259 117 277 122 L276 157 Q260 152 243 159 Q228 153 212 157Z" fill="${paper}"/><path d="M243 124 L243 157 M219 132 L235 135 M220 142 L234 145 M250 134 L269 131 M250 144 L267 141" fill="none"/>
  <path d="M236 96 L232 67 L255 65 L254 96Z" fill="${rose}"/><path d="M239 65 L237 48 M247 65 L252 42" fill="none"/><path d="M234 48 Q222 47 227 38 Q235 32 240 41 Q249 37 249 47 Q246 55 234 48Z" fill="${gold}"/><path d="M249 42 Q241 34 247 28 Q255 23 259 32 Q267 30 267 39 Q260 48 249 42Z" fill="${paper}"/>`
const wealth=baseline+`<path d="M27 95 L70 88 L81 121 L36 129Z" fill="${sage}"/><circle cx="53" cy="107" r="8" fill="${paper}"/><path d="M53 100 L53 114 M49 104 L57 104 M49 109 L57 109" fill="none"/>
  <path d="M22 146 L22 157 Q43 165 65 157 L65 145Z" fill="${gold}"/><path d="M22 146 Q43 137 65 145 Q45 154 22 146Z" fill="${gold}"/><path d="M26 135 L26 146 Q46 154 68 145 L68 134Z" fill="${gold}"/><path d="M26 135 Q46 126 68 134 Q47 143 26 135Z" fill="${gold}"/><path d="M24 124 L24 135 Q45 143 66 134 L66 124Z" fill="${gold}"/><path d="M24 124 Q45 116 66 124 Q46 132 24 124Z" fill="${gold}"/>
  <circle cx="79" cy="147" r="12" fill="${gold}"/><path d="M79 140 L79 154 M74 144 L84 144 M74 149 L84 149" fill="none"/>
  <path d="M217 122 Q211 98 245 97 Q275 98 280 123Z" fill="${sage}"/><path d="M219 123 L280 123 L278 158 L220 159Z" fill="${rose}"/><path d="M230 102 L230 157 M266 102 L267 158" fill="none"/><path d="M239 121 L253 121 L253 140 L239 140Z" fill="${gold}"/><circle cx="246" cy="130" r="2" fill="${ink}"/>`
const record=baseline+`<path d="M24 113 L71 108 L77 157 L28 161Z" fill="${sage}"/><path d="M34 122 L61 119 M35 132 L65 129 M36 141 L58 138" fill="none"/><path d="M72 103 L79 91 L86 96 L80 111 L58 142 L52 145 L53 138Z" fill="${gold}"/><path d="M53 138 L58 142 M76 97 L82 102" fill="none"/>
  <path d="M219 116 L259 117 L256 151 Q236 160 223 151Z" fill="${rose}"/><path d="M260 121 Q280 117 274 134 Q271 140 258 138 M218 158 Q241 166 267 158 M232 108 Q226 101 233 94 M245 107 Q239 98 247 91" fill="none"/>
  <path d="M228 133 Q232 126 238 133 Q244 125 248 132 Q250 139 238 145 Q227 140 228 133Z" fill="${paper}"/>`
const sparkle='<path d="M40 55 L44 47 L47 55 L55 58 L47 61 L44 69 L41 61 L33 58Z" fill="'+gold+'"/><path d="M274 73 L277 65 M271 67 L280 72" fill="none"/>'
async function write(name,text,width=900){fs.writeFileSync(path.join(source,name+'.svg'),text);await sharp(Buffer.from(text)).resize({width}).png({palette:true}).toFile(path.join(out,name+'.png'))}
;(async()=>{
  fs.mkdirSync(out,{recursive:true});fs.mkdirSync(source,{recursive:true})
  await write('calico-body',svg(body));await write('calico-tail',svg(tail))
  await write('calico-eyes-open',svg(eyesOpen));await write('calico-eyes-closed',svg(eyesClosed))
  for(const [name,scene] of Object.entries({journal,wealth,record}))await write('calico-scene-'+name,svg(scene+sparkle))
  await write('calico-avatar',svg('<g transform="translate(-66,-14) scale(.7)">'+body+eyesOpen+'</g>',64,64),192)
  const manifestPath=path.join(out,'manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))
  manifest.calico={identity:'dodo-calico',markings:'orange left forehead, dark right ear, orange flank and dark-tipped tail',layers:['calico-body','calico-tail','calico-eyes-open','calico-eyes-closed'],scenes:['journal','wealth','record'],avatar:'calico-avatar'}
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n')
  console.log('Built one shared calico character, three scenes and square avatar')
})().catch(error=>{console.error(error);process.exitCode=1})
