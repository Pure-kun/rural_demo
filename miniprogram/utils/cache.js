/**
 * 本地缓存（带过期时间）
 * 弱网/离线时读缓存兜底，避免白屏
 */
const PREFIX = 'cache_'
const DEFAULT_TTL = 24 * 60 * 60 * 1000

function set(key, value, ttl) {
  try {
    wx.setStorageSync(PREFIX + key, {
      v: value,
      e: Date.now() + (ttl || DEFAULT_TTL),
    })
  } catch (e) {
    // storage 写满时忽略，不影响主流程
  }
}

/**
 * @param {boolean} allowStale 允许读过期缓存（离线时用，总比白屏强）
 */
function get(key, allowStale) {
  try {
    const o = wx.getStorageSync(PREFIX + key)
    if (!o) return null
    if (!allowStale && o.e && Date.now() > o.e) {
      wx.removeStorageSync(PREFIX + key)
      return null
    }
    return o.v
  } catch (e) {
    return null
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(PREFIX + key)
  } catch (e) {}
}

module.exports = { set, get, remove }
