const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const preview = path.resolve(__dirname, '../design/preview')
const output = path.resolve(process.argv[2] || preview)
fs.mkdirSync(output,{recursive:true})
const url = pathToFileURL(path.join(preview, 'index.html')).href
function avatarMetrics() {
  const button=document.querySelector('.avatar-button'),crop=document.querySelector('.avatar-crop'),img=document.querySelector('.avatar-image')
  const rect=button.getBoundingClientRect(),frame=crop.getBoundingClientRect(),image=img.getBoundingClientRect()
  const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2)
  return {squareAvatar:[rect,frame,image].every(box=>Math.abs(box.width-box.height)<1),
    roundedAvatar:parseFloat(getComputedStyle(crop).borderRadius)>0 && getComputedStyle(crop).overflow==='hidden',
    avatarFits:image.left>=frame.left-1 && image.top>=frame.top-1 && image.right<=frame.right+1 && image.bottom<=frame.bottom+1,
    avatarCropped:getComputedStyle(img).objectFit==='cover',
    avatarHitTarget:hit===button || button.contains(hit),
    vipText:document.querySelector('.vip-desc').textContent.trim()==='拍照数上限 / 照片漫画风 / 家庭账本'}
}
;(async () => {
  const browser = await chromium.launch({ headless: true })
  try {
  const results = []
  for (const width of [393, 320, 430]) {
    const page = await browser.newPage({ viewport: { width, height: width === 320 ? 568 : 852 }, deviceScaleFactor: 2 })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    for (const name of ['ledger', 'assets', 'record', 'charts', 'profile', 'ledger-manage', 'ledger-edit', 'asset-edit', 'bill', 'settings']) {
      await page.goto(url + '?page=' + name)
      await page.evaluate(()=>document.fonts.ready)
      await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))))
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      if (width === 393) await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true })
      const metrics = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter(i => !i.naturalWidth).map(i => i.src),
        pageTitle: document.querySelector('.brand')?.getAttribute('aria-label') || document.querySelector('.big,.nav-title')?.textContent.trim(),
        tabVisible: !!document.querySelector('.bar'),
        barCount:document.querySelectorAll('.bar').length,
        handwritingLoaded:document.fonts.check('16px DodoHand'),
        handwritingApplied:getComputedStyle(document.querySelector('.page')).fontFamily.includes('DodoHand')
      }))
      metrics.expectedBars=['ledger','assets','charts','profile'].includes(name)?1:0
      if(['ledger','assets','record'].includes(name)) {
        Object.assign(metrics,await page.evaluate(()=>{
          const host=document.querySelector('calico-cat'),body=host.querySelector('img[src$="calico-body.png"]')
          const scene=host.querySelector('img[src*="calico-scene-"]')
          return {sameCalico:body.naturalWidth===900,catScene:scene.getAttribute('src').split('calico-scene-')[1].split('.')[0],
            animatedCat:host.querySelector('.cat-breath').getAnimations().length>0 && host.querySelector('.cat-tail').getAnimations().length>0}
        }))
        Object.assign(metrics,await page.evaluate(async()=>{
          const breath=document.querySelector('.cat-breath'),tail=document.querySelector('.cat-tail')
          const open=document.querySelector('.cat-eyes-open'),closed=document.querySelector('.cat-eyes-closed')
          const animations=[breath,tail,open,closed].map(node=>node.getAnimations()[0])
          for(const animation of animations){animation.pause();animation.currentTime=0}
          await new Promise(requestAnimationFrame)
          const first=[getComputedStyle(breath).transform,getComputedStyle(tail).transform,getComputedStyle(open).opacity]
          animations[0].currentTime=1800;animations[1].currentTime=1400;animations[2].currentTime=2924;animations[3].currentTime=2924
          await new Promise(requestAnimationFrame)
          const result={catBreathes:first[0]!==getComputedStyle(breath).transform,catWagsTail:first[1]!==getComputedStyle(tail).transform,
            catBlinks:first[2]==='1' && getComputedStyle(open).opacity==='0' && getComputedStyle(closed).opacity==='1'}
          for(const animation of animations)animation.play()
          return result
        }))
        await page.emulateMedia({reducedMotion:'reduce'})
        metrics.catReducedMotion=await page.evaluate(()=>getComputedStyle(document.querySelector('.cat-tail')).animationName==='none')
        await page.emulateMedia({reducedMotion:'no-preference'})
      }
      if(name==='profile') Object.assign(metrics,await page.evaluate(avatarMetrics))
      if(name==='ledger') metrics.ledgerSummaryCorrect=await page.evaluate(()=>!document.querySelector('.overview').textContent.includes('本月收入') && document.querySelector('.journal-motto').textContent.includes('lovely days'))
      if(name==='asset-edit') metrics.fundCategoriesCorrect=await page.evaluate(()=>{
        const labels=[...document.querySelectorAll('.category-option')].map(node=>node.textContent.trim())
        return ['娱乐','教育基金','养老基金','住房基金'].every(label=>labels.includes(label)) && !labels.some(label=>['现金零钱','银行卡','支付账户'].includes(label))
      })
      if(name==='profile') metrics.brandCorrect=await page.locator('.signoff-title').textContent().then(t=>t==='哆哆记账') && await page.locator('.signoff-credit').textContent().then(t=>t==='呼噜厨房出品')
      results.push({ page: name, ...metrics, errors: [...errors] })
      if(name==='profile') {
        for(const [shape,w,h] of [['portrait',240,720],['landscape',720,240]]) {
          await page.evaluate(async({w,h})=>{
            const img=document.querySelector('.avatar-image')
            img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#e0bd99"/><circle cx="${w/2}" cy="${h/2}" r="85" fill="#fff8e7"/><path d="M${w/2-25} ${h/2}h50" stroke="#55483d" stroke-width="8"/></svg>`)
            await img.decode()
            // Native button content may have its own dimensions. The avatar
            // must stay independent of this internal content's layout.
            document.querySelector('.avatar-button').innerHTML='<div style="width:22px;height:130px">native button wrapper</div>'
          },{w,h})
          results.push({page:'profile-'+shape,width,...await page.evaluate(avatarMetrics)})
          if(width===393) await page.screenshot({path:path.join(output,'profile-'+shape+'.png'),fullPage:true})
        }
      }
    }
    await page.goto(url + '?page=record&detail=1')
    await page.evaluate(()=>document.fonts.ready)
    if (width === 393) await page.screenshot({ path: path.join(output, 'record-detail.png'), fullPage: true })
    await page.goto(url + '?page=record&detail=1&large=1')
    await page.evaluate(()=>document.fonts.ready)
    results.push(await page.evaluate(() => {
      const sheet = document.querySelector('.detail-layer').getBoundingClientRect()
      const finish = document.querySelector('.finish').getBoundingClientRect()
      const date=document.querySelector('.date-key').getBoundingClientRect()
      const plus=document.querySelector('.operator-key').getBoundingClientRect()
      const keypad=document.querySelector('.keypad').getBoundingClientRect()
      const column=document.querySelector('.action-column').getBoundingClientRect()
      const key=document.querySelector('.key').getBoundingClientRect()
      const range=document.createRange()
      range.selectNodeContents(document.querySelector('.finish-label'))
      const label=range.getBoundingClientRect()
      return { page:'record-detail',width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        finishVisible:finish.top >= sheet.top && finish.bottom <= innerHeight + 1 && finish.left >= -1 && finish.right <= innerWidth + 1,
        columnWidthDifference:Math.abs(column.width-key.width),
        keypadRightOverflow:Math.max(0,column.right-keypad.right,finish.right-innerWidth),
        labelFits:label.left>=finish.left && label.right<=finish.right && label.top>=finish.top && label.bottom<=finish.bottom,
        detailScroll:document.querySelector('.detail-scroll').clientHeight,
        keypadGap:Math.abs(plus.top-date.bottom),
        labelOffsetX:Math.abs((label.left+label.right-finish.left-finish.right)/2),
        labelOffsetY:Math.abs((label.top+label.bottom-finish.top-finish.bottom)/2) }
    }))
    for (const innerHeight of ['auto','12px']) {
      results.push(await page.evaluate(innerHeight => {
        // Model a native picker's extra internal wrapper instead of assuming
        // that its direct WXML child inherits the grid cell's full height.
        const picker=document.querySelector('.date-picker')
        const inner=document.createElement('view')
        inner.style.cssText='display:block;position:relative;height:'+innerHeight
        while(picker.firstChild)inner.append(picker.firstChild)
        picker.append(inner)
        const cell=document.querySelector('.date-cell').getBoundingClientRect()
        const date=document.querySelector('.date-key').getBoundingClientRect()
        const plus=document.querySelector('.operator-key').getBoundingClientRect()
        const target=picker.getBoundingClientRect()
        return {page:'record-date-picker-'+innerHeight,width:innerWidth,
          keypadGap:Math.abs(plus.top-date.bottom),
          dateFillsCell:Math.abs(date.height-cell.height)<1 && Math.abs(date.top-cell.top)<1,
          datePickerCovers:Math.abs(target.height-cell.height)<1 && Math.abs(target.width-cell.width)<1,
          dateTouchable:[.1,.5,.9].every(fraction=>!!document.elementFromPoint(cell.left+cell.width/2,cell.top+cell.height*fraction)?.closest('.date-picker'))}
      },innerHeight))
    }
    await page.goto(url+'?page=record&income=1')
    await page.evaluate(()=>document.fonts.ready)
    await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))))
    if(width===393)await page.screenshot({path:path.join(output,'record-income.png'),fullPage:true})
    results.push(await page.evaluate(()=>({page:'record-income',width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      incomeIcons:document.querySelectorAll('.category-icon img').length,
      brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)})))
    for (const name of ['ledger','assets','charts']) {
      await page.goto(url + '?page=' + name + '&large=1')
      results.push(await page.evaluate(name => ({ page:name+'-large',width:innerWidth,scrollWidth:document.documentElement.scrollWidth }),name))
    }
    await page.goto(url + '?page=ledger&empty=1')
    if (width === 393) await page.screenshot({path:path.join(output,'ledger-empty.png'),fullPage:true})
    await page.goto(url + '?page=ledger&photos=1')
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))))
    if (width === 393) await page.screenshot({path:path.join(output,'ledger-photos.png'),fullPage:true})
    results.push(await page.evaluate(() => ({
      page:'ledger-photos',width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      thumbnails:document.querySelectorAll('.tx-photo').length,
      brokenImages:[...document.images].filter(img=>!img.naturalWidth).map(img=>img.src)
    })))
    for (const photos of [false,true]) {
    await page.goto(url + '?page=ledger&swipe=1' + (photos ? '&photos=1' : ''))
    // Stress native-button defaults; the delete control must not inherit them.
    await page.addStyleTag({content:'button { min-width:184px; padding:0 14px; line-height:2.56; }'})
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))))
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    if(width===393)await page.screenshot({path:path.join(output,photos ? 'ledger-swipe.png' : 'ledger-swipe-plain.png'),fullPage:true})
    // Hit testing is meaningful only after the row is inside the viewport.
    await page.locator('.tx-entry.is-open').evaluate(node=>node.scrollIntoView({block:'center'}))
    results.push(await page.evaluate(photos => {
      const row=document.querySelector('.tx-entry.is-open').getBoundingClientRect()
      const content=document.querySelector('.tx-entry.is-open .tx-content').getBoundingClientRect()
      const button=document.querySelector('.tx-delete').getBoundingClientRect()
      const style=getComputedStyle(document.querySelector('.tx-delete'))
      const eraserNode=document.querySelector('.eraser-icon')
      const eraser=eraserNode.getBoundingClientRect()
      const iconCenter=document.elementFromPoint(eraser.left+eraser.width/2,eraser.top+eraser.height/2)
      return {page:photos ? 'ledger-swipe' : 'ledger-swipe-plain',width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        revealWidth:row.right-content.right,deleteWidth:button.width,
        deleteHitSize:button.width>=44 && button.height>=44,
        deleteNoBackground:style.backgroundColor==='rgba(0, 0, 0, 0)',
        deleteFits:button.left>=content.right && button.right<=row.right && button.top>=row.top && button.bottom<=row.bottom,
        deleteTouchable:!!iconCenter?.closest('.tx-delete'),
        eraserVisible:eraser.width>0 && eraser.height>0 && eraserNode.naturalWidth===192,
        eraserFits:eraser.left>=button.left && eraser.right<=button.right && eraser.top>=button.top && eraser.bottom<=button.bottom,
        brokenImages:[...document.images].filter(img=>!img.naturalWidth).map(img=>img.src)}
    },photos))
    }
    await page.goto(url + '?page=ledger')
    await page.locator('.visibility-toggle').click()
    results.push({ page:'ledger-privacy',width,hidden:await page.locator('.hero-amount').textContent().then(t=>t.includes('••••')) })
    await page.close()
  }
  fs.writeFileSync(path.join(output,'browser-audit.json'), JSON.stringify(results,null,2))
  const board = await browser.newPage({ viewport:{width:1240,height:1040}, deviceScaleFactor:1 })
  await board.goto(pathToFileURL(path.join(preview,'../preview-board.html')).href)
  await board.evaluate(base=>{for(const img of document.images)img.src=base+img.getAttribute('src').split('/').pop()},pathToFileURL(output+path.sep).href)
  await board.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
  await board.screenshot({path:path.join(output,'overview.png'),fullPage:true})
  await board.close()
  console.log(JSON.stringify(results,null,2))
  if (results.some(r => r.scrollWidth > r.width + 1 || r.brokenImages?.length || r.errors?.length ||
    r.finishVisible === false || r.hidden === false || (r.expectedBars!==undefined && r.barCount!==r.expectedBars) ||
    r.keypadGap>1 || r.labelOffsetX>2 || r.labelOffsetY>2 || r.columnWidthDifference>1 || r.keypadRightOverflow>1 ||
    r.labelFits===false || r.deleteNoBackground===false || r.deleteFits===false || r.deleteTouchable===false || r.eraserVisible===false || r.eraserFits===false || r.deleteHitSize===false || r.brandCorrect===false ||
    r.sameCalico===false || r.animatedCat===false || r.catBreathes===false || r.catWagsTail===false || r.catBlinks===false || r.catReducedMotion===false || r.squareAvatar===false || r.avatarFits===false || r.vipText===false ||
    r.roundedAvatar===false || r.avatarCropped===false || r.avatarHitTarget===false || r.ledgerSummaryCorrect===false || r.fundCategoriesCorrect===false ||
    r.dateFillsCell===false || r.datePickerCovers===false || r.dateTouchable===false || r.handwritingLoaded===false || r.handwritingApplied===false)) process.exitCode = 1
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
