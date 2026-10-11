/**
 * 语音能力封装（微信同声传译插件 WechatSI）
 *
 * 设计考虑：
 * 1. 插件未配置时（如游客模式、未在后台添加插件）不能崩，要能优雅降级
 * 2. 降级后用"模拟识别"让交互流程能完整演示，方便先看设计与流程
 * 3. 语音播报失败必须静默，绝不能阻断主流程
 */
const mock = require('./mock')

let plugin = null
try {
  plugin = requirePlugin('WechatSI')
} catch (e) {
  plugin = null
}

const available = !!plugin

// ---------------- 语音识别 ----------------
let manager = null
let handlers = { onText: null, onEnd: null, onError: null }
let simulating = false
let simTimer = null

if (available) {
  manager = plugin.getRecordRecognitionManager()
  manager.onRecognize = (res) => {
    if (handlers.onText) handlers.onText(res.result || '')
  }
  manager.onStop = (res) => {
    if (handlers.onEnd) handlers.onEnd(res.result || '')
  }
  manager.onError = (err) => {
    if (handlers.onError) handlers.onError(err)
  }
}

/**
 * 开始录音识别
 * @param {function} onText 实时中间结果（边说边出字）
 * @param {function} onEnd  最终结果
 * @param {function} onError
 * @param {number}   duration 最长录音毫秒数
 */
function startRecord(opt) {
  const o = opt || {}
  handlers.onText = o.onText || null
  handlers.onEnd = o.onEnd || null
  handlers.onError = o.onError || null

  if (!available) {
    // 模拟识别：2 秒后逐字吐出结果，用于演示完整交互流程
    simulating = true
    if (handlers.onText) handlers.onText('正在听您说……')
    simTimer = setTimeout(() => {
      if (!simulating) return
      const text = mock.voiceSample()
      if (handlers.onText) handlers.onText(text)
      if (handlers.onEnd) handlers.onEnd(text)
      simulating = false
    }, 1600)
    return
  }

  try {
    manager.start({ lang: 'zh_CN', duration: o.duration || 60000 })
  } catch (e) {
    if (handlers.onError) handlers.onError(e)
  }
}

function stopRecord() {
  if (!available) {
    // 模拟模式：松手时立刻给出结果
    if (simulating) {
      clearTimeout(simTimer)
      const text = mock.voiceSample()
      if (handlers.onText) handlers.onText(text)
      if (handlers.onEnd) handlers.onEnd(text)
      simulating = false
    }
    return
  }
  try {
    manager.stop()
  } catch (e) {
    // 忽略
  }
}

// ---------------- 语音播报 ----------------
let audioCtx = null

/**
 * 朗读一段文字
 * @param {string} text
 * @param {object} opt { onEnd }
 */
function speak(text, opt) {
  const o = opt || {}
  if (!text) {
    if (o.onEnd) o.onEnd()
    return
  }

  if (!available) {
    // 未配置插件：不播报，直接回调，保证流程继续
    if (o.onEnd) setTimeout(o.onEnd, 300)
    return
  }

  const content = text.length > 200 ? text.slice(0, 200) : text

  plugin.textToSpeech({
    lang: 'zh_CN',
    tts: true,
    content,
    success(res) {
      try {
        if (audioCtx) {
          audioCtx.destroy()
          audioCtx = null
        }
        audioCtx = wx.createInnerAudioContext()
        audioCtx.src = res.filename
        audioCtx.onEnded(() => {
          if (o.onEnd) o.onEnd()
        })
        audioCtx.onError(() => {
          if (o.onEnd) o.onEnd()
        })
        audioCtx.play()
      } catch (e) {
        if (o.onEnd) o.onEnd()
      }
    },
    fail() {
      // 播报失败不影响任何主流程
      if (o.onEnd) o.onEnd()
    },
  })
}

function stopSpeak() {
  try {
    if (audioCtx) {
      audioCtx.stop()
      audioCtx.destroy()
      audioCtx = null
    }
  } catch (e) {}
}

module.exports = {
  available,
  startRecord,
  stopRecord,
  speak,
  stopSpeak,
}
