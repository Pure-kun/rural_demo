const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')
const cache = require('../../utils/cache')

Page({
  data: {
    themeClass: 'theme-normal',
    list: [],
    loading: true,
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh())
  },

  load() {
    this.setData({ loading: true })
    return request
      .get('/notice/page', { pageNum: 1, pageSize: 50 }, { silent: true })
      .then((page) => {
        const list = ((page && page.records) || []).map((notice) => Object.assign({}, notice, {
          timeText: format.oralTime(notice.createTime),
        }))
        this.setData({ list, loading: false })
      })
      .catch(() => this.setData({ loading: false }))
  },

  addNotice() {
    wx.navigateTo({ url: '/pages/notice-edit/notice-edit' })
  },

  editNotice(e) {
    wx.navigateTo({ url: '/pages/notice-edit/notice-edit?id=' + e.currentTarget.dataset.id })
  },

  deleteNotice(e) {
    const id = e.currentTarget.dataset.id
    const title = e.currentTarget.dataset.title
    wx.showModal({
      title: '确认删除',
      content: '确定删除“' + title + '”吗？',
      confirmText: '删除',
      confirmColor: '#C7362F',
      success: (res) => {
        if (!res.confirm) return
        request({ url: '/notice/' + id, method: 'DELETE', loading: true, queueable: false })
          .then(() => {
            cache.remove('notice_list')
            wx.showToast({ title: '已删除', icon: 'success' })
            this.load()
          })
          .catch(() => {})
      },
    })
  },
})
