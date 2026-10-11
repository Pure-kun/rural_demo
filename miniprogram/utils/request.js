/**
 * 请求封装
 *
 * 解决四件事：
 * 1. 后端所有业务响应 HTTP 都是 200，成败看 body.code —— 这里统一剥壳
 * 2. 未登录时后端返回 HTTP 401 —— 这里统一跳登录页
 * 3. 弱网：读接口自动重试 + 缓存兜底
 * 4. 写接口断网自动入离线队列，恢复后补交（带幂等键）
 */
const { BASE_URL, USE_MOCK } = require('./config')
const mock = require('./mock')
const cache = require('./cache')
const network = require('./network')
const queue = require('./offline-queue')

const TIMEOUT = {
  read: 8000,
  write: 15000,
  ai: 30000,
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function gotoLogin() {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1]
  const route = cur ? cur.route : ''
  if (route === 'pages/login/login') return
  wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
  setTimeout(() => {
    wx.reLaunch({ url: '/pages/login/login' })
  }, 800)
}

/**
 * 最底层请求（不含重试/缓存/队列），离线队列补交时也复用它
 */
function raw(opt) {
  const { url, method = 'GET', data = {}, header = {}, timeout } = opt

  if (USE_MOCK) {
    return mock.mockRequest(url, method, data)
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      timeout: timeout || TIMEOUT.read,
      header: Object.assign({ 'Content-Type': 'application/json' }, header),
      success: (res) => {
        // 未登录 / token 过期：后端走的是真实 HTTP 401
        if (res.statusCode === 401) {
          gotoLogin()
          return reject({ type: 'UNAUTHORIZED', code: 401, msg: '未登录' })
        }
        if (!res.data || typeof res.data.code === 'undefined') {
          return reject({ type: 'BAD_RESPONSE', statusCode: res.statusCode })
        }
        if (res.data.code === 200) {
          return resolve(res.data.data)
        }
        reject({ type: 'BIZ', code: res.data.code, msg: res.data.msg })
      },
      fail: () => reject({ type: 'NETWORK' }),
    })
  })
}

/**
 * 业务层统一入口
 * @param {string}  url
 * @param {string}  method
 * @param {object}  data
 * @param {boolean} loading    显示 loading
 * @param {boolean} silent     失败不弹 toast
 * @param {string}  cacheKey   传了就缓存 GET 结果
 * @param {number}  cacheTTL
 * @param {number}  retry      读接口自动重试次数
 * @param {boolean} queueable  断网时是否入离线队列（写接口用）
 * @param {boolean} ai         使用更长的超时
 */
function request(opt) {
  const url = opt.url
  const method = opt.method || 'GET'
  const data = opt.data || {}
  const loading = opt.loading
  const silent = opt.silent
  const cacheKey = opt.cacheKey
  const cacheTTL = opt.cacheTTL
  const retry = opt.retry === undefined ? 2 : opt.retry
  const queueable = opt.queueable
  const isWrite = method !== 'GET'
  const timeout = opt.timeout || (opt.ai ? TIMEOUT.ai : isWrite ? TIMEOUT.write : TIMEOUT.read)
  const requestId = isWrite ? opt.requestId || uuid() : null
  const header = requestId ? { 'X-Request-Id': requestId } : {}

  if (loading) wx.showLoading({ title: '加载中', mask: true })

  const done = () => {
    if (loading) wx.hideLoading()
  }

  // 完全离线：读接口走缓存，写接口直接进队列
  if (!USE_MOCK && !network.isOnline()) {
    if (!isWrite && cacheKey) {
      const stale = cache.get(cacheKey, true)
      if (stale) {
        done()
        wx.showToast({ title: '当前为缓存数据', icon: 'none' })
        return Promise.resolve(stale)
      }
    }
    if (isWrite && queueable) {
      queue.push({ url, method, data, requestId })
      done()
      wx.showToast({ title: '网络不佳，已保存，恢复后自动提交', icon: 'none', duration: 3000 })
      return Promise.resolve({ __queued: true, requestId })
    }
    done()
    if (!silent) wx.showToast({ title: '网络不可用，请检查网络', icon: 'none' })
    return Promise.reject({ type: 'OFFLINE' })
  }

  const maxTry = isWrite ? 0 : retry

  const attempt = (i) =>
    raw({ url, method, data, header, timeout }).then(
      (result) => {
        if (!isWrite && cacheKey) cache.set(cacheKey, result, cacheTTL)
        done()
        return result
      },
      (e) => {
        if (e.type === 'BIZ' || e.type === 'BAD_RESPONSE' || e.type === 'UNAUTHORIZED') throw e
        if (i < maxTry) {
          return sleep(300 * Math.pow(2, i)).then(() => attempt(i + 1))
        }
        throw e
      }
    )

  return attempt(0).catch((e) => {
    // 写接口 + 网络问题 → 进离线队列
    if (isWrite && queueable && (e.type === 'NETWORK' || e.type === 'OFFLINE')) {
      queue.push({ url, method, data, requestId })
      done()
      wx.showToast({ title: '网络不佳，已保存，恢复后自动提交', icon: 'none', duration: 3000 })
      return { __queued: true, requestId }
    }
    done()
    if (!silent && e.type !== 'UNAUTHORIZED') {
      const msg =
        e.type === 'NETWORK' ? '网络异常，请重试'
          : e.msg || '操作失败'
      wx.showToast({ title: msg, icon: 'none' })
    }
    throw e
  })
}

function get(url, data, opt) {
  return request(Object.assign({ url, method: 'GET', data }, opt || {}))
}

function post(url, data, opt) {
  return request(Object.assign({ url, method: 'POST', data, queueable: true }, opt || {}))
}

/**
 * 图片上传（注意 wx.uploadFile 的 data 是字符串，需要 parse）
 */
function upload(filePath) {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve({ url: 'https://placeholder.local/mock.jpg' }), 600))
  }
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + '/file/upload',
      filePath,
      name: 'file',
      timeout: 60000,
      success: (res) => {
        let body
        try {
          body = JSON.parse(res.data)
        } catch (e) {
          return reject({ type: 'BAD_RESPONSE' })
        }
        if (body.code === 200) resolve(body.data)
        else reject({ type: 'BIZ', msg: body.msg })
      },
      fail: () => reject({ type: 'NETWORK' }),
    })
  })
}

module.exports = Object.assign(request, { raw, get, post, upload, uuid })
