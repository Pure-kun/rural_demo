const app = getApp()
const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')
const network = require('../../utils/network')
const queue = require('../../utils/offline-queue')

Page({
  data: {
    themeClass: 'theme-normal',
    greeting: '你好',
    todayText: '',
    userName: '',
    stats: { pending: 0, processing: 0, done: 0 },
    notices: [],
    calls: [],
    isOnline: true,
    queueCount: 0,
  },

  onShow() {
    this.setData({
      themeClass: theme.getClass(),
      isOnline: network.isOnline(),
      queueCount: queue.count(),
    })
    this.initHeader()
    this.loadStats()
    this.loadNotices()
    this.loadContacts()
  },

  initHeader() {
    const h = new Date().getHours()
    const greeting = h < 6 ? '凌晨好' : h < 12 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好'
    const d = new Date()
    const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()]
    const user = app.globalData.userInfo || {}
    this.setData({
      greeting,
      todayText: (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + week,
      userName: user.realName || '乡亲',
    })
  },

  loadStats() {
    const user = app.globalData.userInfo || {}
    request
      .get(
        '/workorder/page',
        { userId: user.id || 3, role: user.role === undefined ? 0 : user.role, pageNum: 1, pageSize: 50 },
        { silent: true, cacheKey: 'home_orders_' + (user.id || 3), cacheTTL: 3 * 60 * 1000 }
      )
      .then((page) => {
        const list = (page && page.records) || []
        let pending = 0
        let processing = 0
        let done = 0
        list.forEach((o) => {
          if (o.status === 0) pending++
          else if (o.status === 1 || o.status === 2) processing++
          else done++
        })
        this.setData({ stats: { pending, processing, done } })
      })
      .catch(() => {})
  },

  loadNotices() {
    request
      .get('/notice/page', { pageNum: 1, pageSize: 3 }, { silent: true, cacheKey: 'home_notices' })
      .then((page) => {
        const list = ((page && page.records) || []).map((n) =>
          Object.assign({}, n, { timeText: format.oralTime(n.createTime) })
        )
        this.setData({ notices: list })
      })
      .catch(() => {})
  },

  loadContacts() {
    request
      .get('/common/contacts', {}, { silent: true })
      .then((list) => this.setData({ calls: list || [] }))
      .catch(() => {})
  },

  // ---------- 跳转 ----------
  goSubmit() {
    wx.navigateTo({ url: '/pages/workorder-submit/workorder-submit' })
  },

  goList() {
    wx.switchTab({ url: '/pages/workorder-list/workorder-list' })
  },

  goNotices() {
    wx.switchTab({ url: '/pages/notice-list/notice-list' })
  },

  goAi() {
    wx.navigateTo({ url: '/pages/ai-chat/ai-chat' })
  },

  goNoticeDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/notice-detail/notice-detail?id=' + id })
  },

  onCall() {
    const list = this.data.calls
    if (!list.length) {
      wx.showToast({ title: '暂无联系方式', icon: 'none' })
      return
    }
    if (list.length === 1) {
      this.doCall(list[0])
      return
    }
    wx.showActionSheet({
      itemList: list.map((c) => c.name + '（' + c.title + '）'),
      success: (res) => this.doCall(list[res.tapIndex]),
    })
  },

  doCall(c) {
    wx.makePhoneCall({
      phoneNumber: c.phone,
      fail: () => {},
    })
  },
})
