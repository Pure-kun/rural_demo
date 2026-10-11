const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')
const voice = require('../../utils/voice')

Page({
  data: {
    themeClass: 'theme-normal',
    id: null,
    order: null,
    logs: [],
    loading: true,
    urging: false,
    canUrge: false,
    canEvaluate: false,
    speaking: false,
  },

  onLoad(options) {
    this.setData({ id: options.id })
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
    if (this.data.id !== null && this.data.id !== undefined) this.load()
  },

  load() {
    const id = this.data.id
    this.setData({ loading: true })

    Promise.all([
      request.get('/workorder/detail', { id }, { silent: true }),
      request.get('/workorder/logs', { workOrderId: id }, { silent: true }).catch(() => []),
    ])
      .then((res) => {
        const o = res[0] || {}
        const logs = (res[1] || []).map((l) =>
          Object.assign({}, l, { timeText: format.fullTime(l.createTime) })
        )
        const info = format.statusInfo(o.status)
        // 后端目前只有 0/1/2；2 表示已办结，未评价则引导评价
        const canUrge = o.status === 0 || o.status === 1
        const canEvaluate = o.status === 2 && !o.evaluateScore

        this.setData({
          order: Object.assign({}, o, {
            statusText: info.oral,
            statusIcon: info.icon,
            statusTag: info.tag,
            categoryText: format.categoryText(o.category),
            urgencyText: format.urgencyInfo(o.urgency).text,
            createText: format.fullTime(o.createTime),
            updateText: format.fullTime(o.updateTime),
            images: o.images || [],
          }),
          logs,
          loading: false,
          canUrge,
          canEvaluate,
        })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.index
    wx.previewImage({ current: this.data.order.images[idx], urls: this.data.order.images })
  },

  // 把处理结果念给老人听
  speakResult() {
    const o = this.data.order
    if (!o) return
    if (this.data.speaking) {
      voice.stopSpeak()
      this.setData({ speaking: false })
      return
    }
    const text = '您反映的' + o.title + '，' + format.statusText(o.status, true) +
      (o.result ? '。处理结果是：' + o.result : '')
    this.setData({ speaking: true })
    voice.speak(text, {
      onEnd: () => this.setData({ speaking: false }),
    })
  },

  urge() {
    if (this.data.urging) return
    this.setData({ urging: true })
    request
      .post('/workorder/urge', { id: this.data.order.id, userId: 3 }, { loading: true })
      .then((res) => {
        this.setData({ urging: false })
        wx.showToast({ title: '已提醒村干部', icon: 'success' })
        if (res && res.urgeCount !== undefined) {
          this.setData({ 'order.urgeCount': res.urgeCount })
        }
      })
      .catch(() => this.setData({ urging: false }))
  },

  evaluate() {
    wx.showActionSheet({
      itemList: ['😞 一般', '🙂 满意', '😄 很满意'],
      success: (res) => {
        const score = [3, 4, 5][res.tapIndex]
        request
          .post('/workorder/evaluate', { id: this.data.order.id, userId: 3, score }, { loading: true })
          .then(() => {
            wx.showToast({ title: '感谢您的评价', icon: 'success' })
            this.load()
          })
          .catch(() => {})
      },
    })
  },

  callHandler() {
    wx.makePhoneCall({
      phoneNumber: '13800138001',
      fail: () => {},
    })
  },
})
