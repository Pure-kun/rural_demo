/**
 * 离线提交队列（弱网自适应）
 *
 * 断网时把写操作存到本地，网络恢复后自动补交。
 * 关键：重发时必须复用同一个 requestId，后端靠它做幂等，
 * 否则"请求其实到了、只是响应丢了"的情况会产生重复工单。
 */
const KEY = 'offline_queue'

function all() {
  try {
    return wx.getStorageSync(KEY) || []
  } catch (e) {
    return []
  }
}

function save(list) {
  try {
    wx.setStorageSync(KEY, list)
  } catch (e) {}
  updateBadge()
}

function push(task) {
  const list = all()
  list.push({
    url: task.url,
    method: task.method || 'POST',
    data: task.data || {},
    requestId: task.requestId,
    ts: Date.now(),
  })
  save(list)
}

function count() {
  return all().length
}

function updateBadge() {
  const n = count()
  const app = getApp()
  if (app) app.globalData.pendingCount = n
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1]
  if (cur && cur.setData) {
    cur.setData({ queueCount: n })
  }
}

/**
 * 冲刷队列：逐条补交
 * @param {function} send (task) => Promise
 */
function flush(send) {
  const list = all()
  if (!list.length) return Promise.resolve({ ok: 0, fail: 0 })

  const rest = []
  let ok = 0
  let fail = 0

  const run = (i) => {
    if (i >= list.length) {
      save(rest)
      if (ok || fail) {
        wx.showToast({
          title: '已自动提交 ' + ok + ' 条' + (fail ? '，' + fail + ' 条失败' : ''),
          icon: 'none',
          duration: 2500,
        })
      }
      return { ok, fail }
    }
    const task = list[i]
    return send(task).then(
      () => {
        ok++
        return run(i + 1)
      },
      (err) => {
        if (err && (err.type === 'NETWORK' || err.type === 'OFFLINE')) {
          rest.push(task) // 还是断网，继续留着
        } else {
          fail++ // 业务错误，重试没意义，丢弃
        }
        return run(i + 1)
      }
    )
  }

  return run(0)
}

function clear() {
  save([])
}

module.exports = { all, push, flush, count, clear, updateBadge }
