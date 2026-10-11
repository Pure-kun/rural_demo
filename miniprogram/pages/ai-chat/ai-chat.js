const request = require('../../utils/request')
const theme = require('../../utils/theme')
const voice = require('../../utils/voice')

const WELCOME = {
  role: 'assistant',
  content: '您好，我是村里的小助手。\n\n您可以问我医保怎么交、低保怎么申请、有什么补贴这类问题。\n\n不会打字也没关系，按住下面的麦克风说话就行。',
}

Page({
  data: {
    themeClass: 'theme-normal',
    messages: [WELCOME],
    input: '',
    sending: false,
    sessionId: '',
    scrollInto: '',
    recording: false,
    speakingIndex: -1,
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  onUnload() {
    voice.stopSpeak()
  },

  onInput(e) {
    this.setData({ input: e.detail.value })
  },

  // ---------------- 语音提问 ----------------
  onMicStart() {
    this._startAt = Date.now()
    this.setData({ recording: true })
    wx.vibrateShort({ type: 'light', fail: () => {} })
    voice.startRecord({
      onText: () => {},
      onEnd: (text) => {
        this.setData({ recording: false })
        if (text) {
          this.setData({ input: text }, () => this.send())
        }
      },
      onError: () => this.setData({ recording: false }),
    })
  },

  onMicEnd() {
    const held = Date.now() - (this._startAt || 0)
    voice.stopRecord()
    if (held < 400) {
      this.setData({ recording: false })
      wx.showToast({ title: '按住按钮再说话哦', icon: 'none' })
    }
  },

  // ---------------- 发送 ----------------
  send() {
    const q = (this.data.input || '').trim()
    if (!q) {
      wx.showToast({ title: '请先输入问题', icon: 'none' })
      return
    }
    if (this.data.sending) return

    const messages = this.data.messages.concat([{ role: 'user', content: q }])
    const aiIndex = messages.length
    messages.push({ role: 'assistant', content: '', pending: true })

    this.setData({
      messages,
      input: '',
      sending: true,
      scrollInto: 'msg-' + (aiIndex - 1),
    })

    request
      .post('/ai/chat', { userId: 3, question: q, sessionId: this.data.sessionId }, { ai: true, queueable: false })
      .then((res) => {
        const key = 'messages[' + aiIndex + ']'
        this.setData({
          [key]: { role: 'assistant', content: (res && res.answer) || '抱歉，我没听明白，您再问一次好吗？' },
          sending: false,
          sessionId: (res && res.sessionId) || this.data.sessionId,
          scrollInto: 'msg-' + aiIndex,
        })
      })
      .catch(() => {
        const key = 'messages[' + aiIndex + ']'
        this.setData({
          [key]: { role: 'assistant', content: '网络不太好，没能查到答案。您可以点下面的按钮直接问村干部。' },
          sending: false,
        })
      })
  },

  // 把 AI 的回答念出来
  speakMessage(e) {
    const idx = e.currentTarget.dataset.index
    if (this.data.speakingIndex === idx) {
      voice.stopSpeak()
      this.setData({ speakingIndex: -1 })
      return
    }
    this.setData({ speakingIndex: idx })
    voice.speak(this.data.messages[idx].content, {
      onEnd: () => this.setData({ speakingIndex: -1 }),
    })
  },

  callVillage() {
    wx.makePhoneCall({
      phoneNumber: '13800138001',
      fail: () => {},
    })
  },

  clearChat() {
    this.setData({ messages: [WELCOME], sessionId: '' })
  },
})
