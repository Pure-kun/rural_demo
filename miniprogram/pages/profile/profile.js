const app = getApp()
const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')
const queue = require('../../utils/offline-queue')

Page({
  data: {
    themeClass: 'theme-normal',
    user: {},
    roleText: '村民',
    levels: [
      { key: 'normal', label: '标准' },
      { key: 'large', label: '大' },
      { key: 'huge', label: '特大' },
    ],
    level: 'normal',
    calls: [],
    queueCount: 0,
  },

  onShow() {
    const level = theme.getLevel()
    const user = app.globalData.userInfo || {}
    this.setData({
      themeClass: theme.getClass(),
      level,
      user,
      roleText: format.roleText(user.role),
      queueCount: queue.count(),
    })
    this.loadContacts()
  },

  loadContacts() {
    request
      .get('/common/contacts', {}, { silent: true })
      .then((list) => this.setData({ calls: list || [] }))
      .catch(() => {})
  },

  // 切换字号：立即生效
  changeLevel(e) {
    const level = e.currentTarget.dataset.level
    theme.setLevel(level)
    this.setData({
      level,
      themeClass: theme.getClass(),
    })
    wx.showToast({ title: '字号已调整', icon: 'none' })
  },

  onCall() {
    const list = this.data.calls
    if (!list.length) {
      wx.showToast({ title: '暂无联系方式', icon: 'none' })
      return
    }
    wx.showActionSheet({
      itemList: list.map((c) => c.name + '（' + c.title + '）'),
      success: (res) => {
        wx.makePhoneCall({ phoneNumber: list[res.tapIndex].phone, fail: () => {} })
      },
    })
  },

  // 补交离线队列
  flushQueue() {
    if (!this.data.queueCount) return
    wx.showLoading({ title: '正在提交', mask: true })
    queue.flush(request.raw).then(() => {
      wx.hideLoading()
      this.setData({ queueCount: queue.count() })
    })
  },

  about() {
    wx.showModal({
      title: '关于',
      content: '乡村便民服务小程序\n\n有事找村里，一句话就办。\n\n当前为设计预览版本，数据均为演示数据。',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？',
      confirmText: '退出',
      success: (res) => {
        if (!res.confirm) return
        app.clearLogin()
        wx.reLaunch({ url: '/pages/login/login' })
      },
    })
  },
})
