const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')

Page({
  data: {
    themeClass: 'theme-normal',
    id: null,
    order: null,
    loading: true,
    result: '',
    saving: false,
  },

  onLoad(options) {
    this.setData({ id: options.id })
    this.load()
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  load() {
    request
      .get('/workorder/detail', { id: this.data.id }, { silent: true })
      .then((order) => {
        this.setData({
          order: Object.assign({}, order, {
            statusText: format.statusText(order.status),
            statusIcon: format.statusInfo(order.status).icon,
            statusTag: format.statusInfo(order.status).tag,
            categoryText: format.categoryText(order.category),
            urgencyText: format.urgencyInfo(order.urgency).text,
            createText: format.fullTime(order.createTime),
          }),
          result: order.result || '',
          loading: false,
        })
      })
      .catch(() => this.setData({ loading: false }))
  },

  onResult(e) {
    this.setData({ result: e.detail.value })
  },

  handle() {
    const { id, result, saving, order } = this.data
    if (saving || !order || order.status === 2) return
    if (!result.trim()) {
      wx.showToast({ title: '请填写处理结果', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    request({
      url: '/workorder/handle',
      method: 'PUT',
      data: { id: Number(id), result: result.trim() },
      loading: true,
      queueable: false,
    })
      .then(() => {
        wx.showToast({ title: '处理完成', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 500)
      })
      .catch(() => this.setData({ saving: false }))
  },
})
