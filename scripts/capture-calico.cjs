// Capture the actual component's three variants, including its CSS animations.
const {chromium}=require('playwright')
const fs=require('node:fs')
const path=require('node:path')
const {pathToFileURL}=require('node:url')
const root=path.resolve(__dirname,'..')
const output=path.join(root,'design/preview/calico-frames')
const url=pathToFileURL(path.join(root,'design/preview/index.html')).href
;(async()=>{
  fs.mkdirSync(output,{recursive:true})
  const browser=await chromium.launch({headless:true})
  try {
    const page=await browser.newPage({viewport:{width:960,height:250},deviceScaleFactor:1})
    const scenes=[]
    for(const name of ['ledger','assets','record']) {
      await page.goto(url+'?page='+name)
      scenes.push(await page.locator('.calico-scene').evaluate(node=>node.outerHTML))
    }
    await page.evaluate(scenes=>{
      document.body.innerHTML='<page class="motion-board">'+scenes.map((scene,i)=>'<section><h2>'+['写手账 · 专注','守金库 · 满足','挂相机 · 准备拍照'][i]+'</h2><div class="motion-scene">'+scene+'</div></section>').join('')+'</page>'
      const style=document.createElement('style')
      style.textContent='html,body{width:960px;height:250px;overflow:hidden}.motion-board{display:flex;min-height:0;width:960px;height:250px;background:#f5efdf}.motion-board section{box-sizing:border-box;width:320px;padding:12px 10px}.motion-board h2{margin:0 0 5px;font-size:18px;text-align:center;font-weight:400}.motion-scene{width:300px;height:185px;background:#fff8e5;border:1px dashed #c1a886;border-radius:12px}'
      document.head.append(style)
    },scenes)
    await page.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(img=>img.decode())]))
    await page.evaluate(()=>document.getAnimations().forEach(animation=>animation.pause()))
    for(let i=0;i<40;i++) {
      await page.evaluate(time=>document.getAnimations().forEach(animation=>{animation.currentTime=time}),i*250)
      await page.screenshot({path:path.join(output,String(i).padStart(2,'0')+'.png')})
    }
    console.log('Captured 40 frames of the actual three cat gestures: '+output)
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})
