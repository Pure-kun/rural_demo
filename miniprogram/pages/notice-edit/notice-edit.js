const request = require('../../utils/request')
const theme = require('../../utils/theme')
const cache = require('../../utils/cache')

Page({
  data: {
    themeClass: 'theme-normal',
    id: '',
    title: '',
    content: '',
    loading: false,
    saving: false,
  },

  onLoad(options) {
    const id = options.id || ''
    this.setData({ id })
    if (id) this.loadNotice(id)
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  loadNotice(id) {
    this.setData({ loading: true })
    request
      .get('/notice/' + id, {}, { silent: true })
      .then((notice) => this.setData({ title: notice.title || '', content: notice.content || '', loading: false }))
      .catch(() => this.setData({ loading: false }))
  },

  onTitle(e) {
    this.setData({ title: e.detail.value })
  },

  onContent(e) {
    this.setData({ content: e.detail.value })
  },

  save() {
    const { id, title, content, saving } = this.data
    if (saving) return
    if (!title.trim()) {
      wx.showToast({ title: '请填写公告标题', icon: 'none' })
      return
    }
    if (!content.trim()) {
      wx.showToast({ title: '请填写公告内容', icon: 'none' })
      return
    }

    const data = { title: title.trim(), content: content.trim() }
    if (id) data.id = Number(id)
    this.setData({ saving: true })
    const saveRequest = id
      ? request({ url: '/notice', method: 'PUT', data, loading: true, queueable: false })
      : request({ url: '/notice', method: 'POST', data, loading: true, queueable: false })

    saveRequest
      .then(() => {
        cache.remove('notice_list')
        wx.showToast({ title: id ? '修改成功' : '发布成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 500)
      })
      .catch(() => this.setData({ saving: false }))
  },
})
