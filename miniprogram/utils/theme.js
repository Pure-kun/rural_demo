/**
 * 适老化字号主题
 * 三档：normal(标准) / large(大) / huge(特大)
 * 首次进入时跟随微信自带的字体大小设置
 */
const KEY = 'theme_level'

const CLASS = {
  normal: 'theme-normal',
  large: 'theme-large',
  huge: 'theme-huge',
}

const LABEL = {
  normal: '标准',
  large: '大',
  huge: '特大',
}

function getLevel() {
  const saved = wx.getStorageSync(KEY)
  if (saved && CLASS[saved]) return saved

  // fontSizeSetting：用户在微信里设置的字体大小，默认 16
  let fs = 16
  try {
    const info = wx.getSystemInfoSync()
    fs = info.fontSizeSetting || 16
  } catch (e) {
    // 忽略，用默认值
  }

  const level = fs >= 21 ? 'huge' : fs >= 17 ? 'large' : 'normal'
  wx.setStorageSync(KEY, level)
  return level
}

function setLevel(level) {
  if (!CLASS[level]) return
  wx.setStorageSync(KEY, level)
  const app = getApp()
  if (app) app.globalData.themeClass = CLASS[level]
}

function getClass() {
  return CLASS[getLevel()]
}

function getLabel() {
  return LABEL[getLevel()]
}

module.exports = {
  LEVELS: ['normal', 'large', 'huge'],
  getLevel,
  setLevel,
  getClass,
  getLabel,
}
