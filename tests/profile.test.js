const assert=require('node:assert/strict')
let saved,review=true
const fileRequests=[],toasts=[]
global.wx={
  getStorageSync:()=>saved,setStorageSync:(key,value)=>{saved=structuredClone(value)},removeStorageSync:()=>{saved=null},
  hideTabBar(){},canIUse:()=>review,getFileSystemManager:()=>({saveFile:options=>fileRequests.push(options)}),
  showToast:options=>toasts.push(options),getUserProfile(){throw new Error('Never silently request WeChat profile')}
}
const store=require('../store/bookkeeping')
store.reset()
let definition
global.Page=value=>{definition=value}
require('../pages/profile/index')
const page={...definition,data:structuredClone(definition.data),setData(patch){Object.assign(this.data,patch)}}
;(async()=>{
  page.onShow()
  assert.equal(page.data.nicknameDraft,'')
  page.focusNickname()
  page.inputNickname({detail:{value:'  微信里的小橘  '}})
  page.nickname({detail:{value:'  微信里的小橘  '}})
  assert.equal(store.getState().profile.nickname,'微信用户')
  page.nicknameReview({detail:{pass:true}})
  assert.equal(store.getState().profile.nickname,'微信里的小橘')
  page.inputNickname({detail:{value:'未通过昵称'}})
  page.nickname({detail:{value:'未通过昵称'}})
  page.nicknameReview({detail:{pass:false}})
  assert.equal(page.data.nicknameDraft,'微信里的小橘')
  assert.equal(store.getState().profile.nickname,'微信里的小橘')
  page.nickname({detail:{value:'  '}})
  assert.equal(store.getState().profile.nickname,'微信里的小橘')
  review=false
  page.nickname({detail:{value:'兼容昵称'}})
  assert.equal(store.getState().profile.nickname,'兼容昵称')
  const pending=page.chooseAvatar({detail:{avatarUrl:'tmp/avatar.jpg'}})
  assert.equal(page.data.avatarSaving,true)
  assert.equal(store.getState().profile.avatarUrl,'')
  assert.equal(page.chooseAvatar({detail:{avatarUrl:'tmp/duplicate.jpg'}}),undefined)
  assert.equal(fileRequests.length,1)
  fileRequests[0].success({savedFilePath:'wxfile://saved/avatar.jpg'})
  await pending
  assert.equal(page.data.avatarSaving,false)
  assert.equal(store.getState().profile.avatarUrl,'wxfile://saved/avatar.jpg')
  assert.equal(store.getState().profile.nickname,'兼容昵称')
  const failure=page.chooseAvatar({detail:{avatarUrl:'tmp/failure.jpg'}})
  fileRequests[1].fail({errMsg:'no space'})
  await failure
  assert.equal(store.getState().profile.avatarUrl,'wxfile://saved/avatar.jpg')
  assert.equal(page.data.avatarSaving,false)
  store.updateProfile({nickname:'微信用户'})
  page.refresh()
  const initial=page.chooseAvatar({detail:{avatarUrl:'tmp/first-avatar.jpg'}})
  fileRequests[2].success({savedFilePath:'wxfile://saved/first-avatar.jpg'})
  await initial
  assert.equal(page.data.nicknameFocus,true)
  assert.equal(page.data.nicknameDraft,'')
  review=true
  page.inputNickname({detail:{value:'哆哆的朋友'}})
  page.nickname({detail:{value:'哆哆的朋友'}})
  page.nicknameReview({detail:{pass:true}})
  assert.equal(saved.profile.nickname,'哆哆的朋友')
  assert.equal(saved.profile.avatarUrl,'wxfile://saved/first-avatar.jpg')
  delete require.cache[require.resolve('../store/bookkeeping')]
  assert.deepEqual(require('../store/bookkeeping').getState().profile,saved.profile)
  assert.ok(toasts.some(x=>x.title.includes('校验')))
  assert.ok(toasts.some(x=>x.title.includes('头像保存失败')))
  console.log('WeChat nickname review, selection guidance, avatar persistence and failure preservation passed')
})().catch(error=>{console.error(error);process.exitCode=1})
