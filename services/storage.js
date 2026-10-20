const KEY = 'xiaoman-bookkeeping-v1'

function load() {
  try { return wx.getStorageSync(KEY) || null } catch (error) { return null }
}

function save(data) {
  wx.setStorageSync(KEY, data)
}

function clear() {
  wx.removeStorageSync(KEY)
}

// Photos and bookkeeping data share the same persistent-storage service.
// Keep temporary camera paths out of saved transactions.
function savePhoto(tempFilePath) {
  return new Promise(resolve => {
    const options = {
      tempFilePath,
      success:result => resolve(result.savedFilePath || null),
      fail:() => resolve(null)
    }
    try {
      if (typeof wx.getFileSystemManager === 'function') {
        wx.getFileSystemManager().saveFile(options)
      } else {
        wx.saveFile(options)
      }
    } catch (error) { resolve(null) }
  })
}

function savePhotos(files) {
  const paths = (Array.isArray(files) ? files : [])
    .filter(file => file && typeof file.tempFilePath === 'string' && file.tempFilePath)
    .map(file => file.tempFilePath)
  return Promise.all(paths.map(savePhoto)).then(results => {
    const photos = results.filter(Boolean)
    return { photos, failed:paths.length - photos.length }
  })
}

module.exports = { load, save, clear, savePhotos }
