const app = getApp()
const theme = require('../../utils/theme')

Page({
  data: {
    themeClass: 'theme-normal',
    userName: '村干部',
    stats: {
      pending: 8,
      processing: 5,
      done: 26,
    },
  },

  onShow() {
    const user = app.globalData.userInfo || {}
    this.setData({
      themeClass: theme.getClass(),
      userName: user.realName || '村干部',
    })
  },

  goWorkorders() {
    wx.navigateTo({ url: '/pages/cadre-workorder-list/cadre-workorder-list' })
  },

  goProducts() {
    wx.navigateTo({ url: '/pages/product-manage/product-manage' })
  },

  goNotices() {
    wx.navigateTo({ url: '/pages/notice-manage/notice-manage' })
  },
})
