const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')
const voice = require('../../utils/voice')

Page({
  data: {
    themeClass: 'theme-normal',
    id: null,
    notice: null,
    loading: true,
    speaking: false,
  },

  onLoad(options) {
    this.setData({ id: options.id })
    this.load()
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  onUnload() {
    voice.stopSpeak()
  },

  load() {
    request
      .get('/notice/' + this.data.id, {}, { silent: true })
      .then((n) => {
        this.setData({
          notice: Object.assign({}, n, { timeText: format.fullTime(n.createTime) }),
          loading: false,
        })
      })
      .catch(() => this.setData({ loading: false }))
  },

  // 念给我听（适老化核心功能）
  speak() {
    if (this.data.speaking) {
      voice.stopSpeak()
      this.setData({ speaking: false })
      return
    }
    const n = this.data.notice
    if (!n) return
    this.setData({ speaking: true })
    voice.speak(n.title + '。' + n.content, {
      onEnd: () => this.setData({ speaking: false }),
    })
  },

  callVillage() {
    wx.makePhoneCall({
      phoneNumber: '13800138001',
      fail: () => {},
    })
  },
})
