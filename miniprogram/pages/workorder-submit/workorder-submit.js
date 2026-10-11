const request = require('../../utils/request')
const theme = require('../../utils/theme')
const voice = require('../../utils/voice')
const format = require('../../utils/format')

Page({
  data: {
    themeClass: 'theme-normal',

    // 语音
    recording: false,
    recognized: '',
    voiceAvailable: voice.available,

    // 表单
    title: '',
    content: '',
    category: null,
    categoryText: '',
    urgency: 1,
    urgencyText: '一般',

    // 照片
    images: [],

    submitting: false,
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  // ---------------- 语音 ----------------
  onMicStart() {
    this._startAt = Date.now()
    this.setData({ recording: true, recognized: '' })

    wx.vibrateShort({
      type: 'light',
      fail: () => {},
    })

    voice.startRecord({
      onText: (text) => {
        this.setData({ recognized: text })
      },
      onEnd: (text) => {
        this.setData({ recording: false })
        if (!text) {
          wx.showToast({ title: '没听清，请再说一次', icon: 'none' })
          return
        }
        this.setData({ recognized: text })
        this.applyText(text)
      },
      onError: () => {
        this.setData({ recording: false })
        wx.showToast({ title: '录音失败，请检查麦克风权限', icon: 'none' })
      },
    })
  },

  onMicEnd() {
    const held = Date.now() - (this._startAt || 0)
    voice.stopRecord()
    if (held < 400) {
      this.setData({ recording: false, recognized: '' })
      wx.showToast({ title: '按住按钮再说话哦', icon: 'none' })
    }
  },

  onMicCancel() {
    voice.stopRecord()
    this.setData({ recording: false, recognized: '' })
  },

  // 把识别到的口语文本拆分并自动分类
  applyText(text) {
    const content = text
    const title = text.length > 14 ? text.slice(0, 14) : text
    this.setData({ title, content }, () => {
      this.analyze()
    })
  },

  // 调用 AI 自动判断分类与紧急度
  analyze() {
    const { title, content } = this.data
    if (!content) return

    request
      .post('/ai/workorder/analyze', { title, content }, { silent: true, queueable: false })
      .then((res) => {
        if (!res) return
        this.setData({
          category: res.category,
          categoryText: format.categoryText(res.category),
          urgency: res.urgency || 1,
          urgencyText: format.urgencyInfo(res.urgency).text,
        })
        wx.showToast({ title: '已自动帮您归类', icon: 'none' })
      })
      .catch(() => {})
  },

  // ---------------- 表单 ----------------
  onTitle(e) {
    this.setData({ title: e.detail.value })
  },

  onContent(e) {
    this.setData({ content: e.detail.value })
  },

  pickCategory() {
    const keys = Object.keys(format.CATEGORY)
    wx.showActionSheet({
      itemList: keys.map((k) => format.CATEGORY[k]),
      success: (res) => {
        const key = keys[res.tapIndex]
        this.setData({ category: Number(key), categoryText: format.CATEGORY[key] })
      },
    })
  },

  // ---------------- 照片 ----------------
  chooseImage() {
    const that = this
    const remain = 3 - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多 3 张照片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showLoading({ title: '上传中', mask: true })
        const tasks = res.tempFiles.map((f) => request.upload(f.tempFilePath))
        Promise.all(tasks)
          .then((results) => {
            wx.hideLoading()
            that.setData({ images: that.data.images.concat(results.map((r) => r.url)) })
          })
          .catch(() => {
            wx.hideLoading()
            wx.showToast({ title: '照片上传失败，可以先提交', icon: 'none' })
          })
      },
    })
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.images.slice()
    images.splice(idx, 1)
    this.setData({ images })
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.index
    wx.previewImage({ current: this.data.images[idx], urls: this.data.images })
  },

  // ---------------- 提交 ----------------
  submit() {
    const { title, content, category, urgency, images } = this.data

    if (!content) {
      wx.showToast({ title: '请先说说您遇到的问题', icon: 'none' })
      return
    }

    this.setData({ submitting: true })

    request
      .post('/workorder/submit', {
        title: title || content.slice(0, 14),
        content,
        category: category || 9,
        urgency: urgency || 1,
        images,
      })
      .then((res) => {
        this.setData({ submitting: false })

        if (res && res.__queued) {
          wx.showModal({
            title: '已保存',
            content: '网络不太好，您的问题已经存好了，联网后会自动帮您发送。',
            showCancel: false,
            confirmText: '知道了',
            success: () => wx.switchTab({ url: '/pages/workorder-list/workorder-list' }),
          })
          return
        }

        // 语音播报提交成功（适老化）
        voice.speak('您的问题已经提交成功，我们会尽快处理')

        wx.showModal({
          title: '提交成功',
          content: '您的问题已经送到村委会了，办好会通知您。',
          showCancel: false,
          confirmText: '好的',
          success: () => {
            this.reset()
            wx.switchTab({ url: '/pages/workorder-list/workorder-list' })
          },
        })
      })
      .catch(() => {
        this.setData({ submitting: false })
      })
  },

  reset() {
    this.setData({
      title: '',
      content: '',
      recognized: '',
      category: null,
      categoryText: '',
      urgency: 1,
      urgencyText: '一般',
      images: [],
    })
  },
})
