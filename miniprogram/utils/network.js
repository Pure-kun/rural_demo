/**
 * 网络状态
 * 弱网自适应的基础：全局维护在线状态，掉线/恢复时通知订阅者
 */
let online = true
let inited = false
const listeners = []

function init(onChange) {
  if (onChange) listeners.push(onChange)
  if (inited) return
  inited = true

  wx.getNetworkType({
    success: (res) => {
      online = res.networkType !== 'none'
    },
  })

  wx.onNetworkStatusChange((res) => {
    const changed = online !== res.isConnected
    online = res.isConnected
    if (changed) {
      listeners.forEach((fn) => {
        try {
          fn(online, res.networkType)
        } catch (e) {
          // 单个回调异常不影响其它
        }
      })
    }
  })
}

function isOnline() {
  return online
}

function subscribe(fn) {
  listeners.push(fn)
}

module.exports = { init, isOnline, subscribe }
