const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const output = path.resolve(__dirname, '../design/preview')
const url = pathToFileURL(path.join(output, 'index.html')).href
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const results = []
  for (const width of [393, 320, 430]) {
    const page = await browser.newPage({ viewport: { width, height: width === 320 ? 568 : 852 }, deviceScaleFactor: 2 })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    for (const name of ['ledger', 'assets', 'record', 'charts', 'profile', 'ledger-manage', 'ledger-edit', 'asset-edit']) {
      await page.goto(url + '?page=' + name)
      await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))))
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      if (width === 393) await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true })
      const metrics = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter(i => !i.naturalWidth).map(i => i.src),
        pageTitle: document.querySelector('.brand')?.getAttribute('aria-label') || document.querySelector('.big,.nav-title')?.textContent.trim(),
        tabVisible: !!document.querySelector('.bar'),
        barCount:document.querySelectorAll('.bar').length
      }))
      metrics.expectedBars=['ledger','assets','charts','profile'].includes(name)?1:0
      if(name==='profile') metrics.brandCorrect=await page.locator('.signoff-title').textContent().then(t=>t==='哆哆记账') && await page.locator('.signoff-credit').textContent().then(t=>t==='呼噜厨房出品')
      results.push({ page: name, ...metrics, errors: [...errors] })
    }
    await page.goto(url + '?page=record&detail=1')
    if (width === 393) await page.screenshot({ path: path.join(output, 'record-detail.png'), fullPage: true })
    await page.goto(url + '?page=record&detail=1&large=1')
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
    await page.goto(url + '?page=ledger&swipe=1&photos=1')
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))))
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    if(width===393)await page.screenshot({path:path.join(output,'ledger-swipe.png'),fullPage:true})
    results.push(await page.evaluate(() => {
      const row=document.querySelector('.tx-entry.is-open').getBoundingClientRect()
      const content=document.querySelector('.tx-entry.is-open .tx-content').getBoundingClientRect()
      const button=document.querySelector('.tx-delete').getBoundingClientRect()
      const style=getComputedStyle(document.querySelector('.tx-delete'))
      return {page:'ledger-swipe',width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        revealWidth:row.right-content.right,deleteWidth:button.width,
        deleteCircle:Math.abs(button.width-button.height)<1 && style.borderRadius==='50%',
        deleteRed:style.backgroundColor==='rgb(220, 75, 75)',
        deleteFits:button.left>=content.right && button.right<=row.right && button.top>=row.top && button.bottom<=row.bottom,
        brokenImages:[...document.images].filter(img=>!img.naturalWidth).map(img=>img.src)}
    }))
    await page.goto(url + '?page=ledger')
    await page.locator('.visibility-toggle').click()
    results.push({ page:'ledger-privacy',width,hidden:await page.locator('.hero-amount').textContent().then(t=>t.includes('••••')) })
    await page.close()
  }
  fs.writeFileSync(path.join(output,'browser-audit.json'), JSON.stringify(results,null,2))
  const board = await browser.newPage({ viewport:{width:1240,height:1040}, deviceScaleFactor:1 })
  await board.goto(pathToFileURL(path.join(output,'../preview-board.html')).href)
  await board.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
  await board.screenshot({path:path.join(output,'overview.png'),fullPage:true})
  await board.close()
  console.log(JSON.stringify(results,null,2))
  await browser.close()
  if (results.some(r => r.scrollWidth > r.width + 1 || r.brokenImages?.length || r.errors?.length ||
    r.finishVisible === false || r.hidden === false || (r.expectedBars!==undefined && r.barCount!==r.expectedBars) ||
    r.keypadGap>1 || r.labelOffsetX>2 || r.labelOffsetY>2 || r.columnWidthDifference>1 || r.keypadRightOverflow>1 ||
    r.labelFits===false || r.deleteCircle===false || r.deleteRed===false || r.deleteFits===false || r.brandCorrect===false)) process.exitCode = 1
})().catch(error => { console.error(error); process.exitCode = 1 })
