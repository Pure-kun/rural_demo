const theme = require('./utils/theme')
const network = require('./utils/network')
const queue = require('./utils/offline-queue')

App({
  globalData: {
    userInfo: null,
    token: '',
    themeClass: 'theme-normal',
    pendingCount: 0,
  },

  onLaunch() {
    // 1. 恢复登录态
    this.globalData.token = wx.getStorageSync('token') || ''
    this.globalData.userInfo = wx.getStorageSync('userInfo') || null

    // 2. 初始化适老化字号（首次进入跟随微信字体设置）
    this.globalData.themeClass = theme.getClass()

    // 3. 网络状态监听 + 恢复后自动补交离线队列
    network.init((isOnline) => {
      if (isOnline) {
        queue.flush()
        wx.showToast({ title: '网络已恢复', icon: 'none' })
      } else {
        wx.showToast({ title: '网络已断开', icon: 'none' })
      }
    })

    this.globalData.pendingCount = queue.count()
  },

  // 统一的登录态写入
  // persist = false 时只放内存，App 重启后需要重新登录（对应登录页「记住我」未勾选）
  setLogin(token, userInfo, persist) {
    const shouldPersist = persist !== false
    this.globalData.token = token
    this.globalData.userInfo = userInfo
    if (shouldPersist) {
      wx.setStorageSync('token', token)
      wx.setStorageSync('userInfo', userInfo)
    } else {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
    }
  },

  clearLogin() {
    this.globalData.token = ''
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },
})
