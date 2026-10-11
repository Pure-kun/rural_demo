const app = getApp()
const request = require('../../utils/request')
const theme = require('../../utils/theme')

Page({
  data: {
    themeClass: 'theme-normal',

    username: 'wangwu',
    password: '123456',
    showPwd: false,
    remember: true,
    agreed: false,
    loading: false,
  },

  onLoad() {
    // 上次勾了「记住我」就把用户名带回来
    const savedUser = wx.getStorageSync('remember_username')
    if (savedUser) {
      this.setData({ username: savedUser })
    }
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  onUsername(e) {
    this.setData({ username: e.detail.value })
  },

  onPassword(e) {
    this.setData({ password: e.detail.value })
  },

  togglePwd() {
    this.setData({ showPwd: !this.data.showPwd })
  },

  toggleRemember() {
    this.setData({ remember: !this.data.remember })
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  onForgot() {
    wx.showModal({
      title: '忘记密码',
      content: '请到村委会找村干部帮您重置密码。',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  openAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '本小程序用于村民反映问题、查看通知、咨询政策。使用即表示您同意我们仅将您的信息用于村务服务，不会对外提供。',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  openPrivacy() {
    wx.showModal({
      title: '隐私授权',
      content: '我们需要使用您的麦克风来支持语音输入，使用相册和相机来支持上传照片。这些信息仅用于办理您提交的村务事项。',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  onLogin() {
    const { username, password, agreed, remember } = this.data

    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    if (!agreed) {
      wx.showToast({ title: '请先阅读并同意用户协议', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    request
      .post('/user/login', { username, password }, { loading: true, queueable: false })
      .then((data) => {
        // 「记住我」决定是否把登录态写进本地存储
        app.setLogin(data.token, data.user, remember)
        if (remember) {
          wx.setStorageSync('remember_username', username)
        } else {
          wx.removeStorageSync('remember_username')
        }

        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 600)
      })
      .catch(() => {})
      .then(() => {
        this.setData({ loading: false })
      })
  },

  onRegister() {
    wx.showModal({
      title: '注册账号',
      content: '请到村委会找村干部登记开通账号，或者用演示账号 wangwu / 123456 先体验。',
      showCancel: false,
      confirmText: '知道了',
    })
  },
})
