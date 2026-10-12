/**
 * 本地 Mock 数据
 * 后端接口未就绪时，用真实感的假数据把页面跑通。
 * 数据取自后端 rural_service.sql 的测试数据，保持字段一致。
 */
const { MOCK_DELAY } = require('./config')

const now = Date.now()
const HOUR = 3600 * 1000
const DAY = 24 * HOUR

function ts(offsetMs) {
  const d = new Date(now - offsetMs)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
    ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
}

// ---------------- 用户 ----------------
const USERS = [
  { id: 1, username: 'zhangsan', realName: '张三', phone: '13800138000', role: 0, createTime: ts(30 * DAY) },
  { id: 2, username: 'lisi', realName: '李四', phone: '13800138001', role: 1, createTime: ts(30 * DAY) },
  { id: 3, username: 'wangwu', realName: '王五', phone: '13800138002', role: 0, createTime: ts(28 * DAY) },
]

// ---------------- 通知公告 ----------------
const NOTICES = [
  {
    id: 3,
    title: '关于村道维修的通知',
    content: '各位村民：村东头道路本周四全天封闭维修，请提前安排出行，绕行村南小路。给大家带来不便，敬请谅解。\n\n村委会',
    createTime: ts(2 * DAY),
    isTop: 1,
    publisherName: '村委会',
    isRead: 0,
  },
  {
    id: 2,
    title: '关于医保缴费的通知',
    content: '各位村民：2026年度城乡居民医保缴费已经开始了，请大家在10月底前完成缴费。可以到村委会现场办理，也可以让子女在手机上帮您交。有不清楚的，随时来问我。\n\n村委会',
    createTime: ts(5 * DAY),
    isTop: 0,
    publisherName: '村委会',
    isRead: 0,
  },
  {
    id: 1,
    title: '关于秋收工作的通知',
    content: '各位村民：本周六开始秋收，请大家提前做好准备。收割机已经联系好了，需要用的到村委会登记一下。',
    createTime: ts(8 * DAY),
    isTop: 0,
    publisherName: '村委会',
    isRead: 1,
  },
]

// ---------------- 农产品 ----------------
const PRODUCTS = [
  {
    id: 1,
    name: '生态大米',
    price: 68.00,
    stock: 120,
    description: '本村生态种植大米，颗粒饱满，口感香糯。',
    imgUrl: '',
    createTime: ts(4 * DAY),
    updateTime: ts(4 * DAY),
  },
  {
    id: 2,
    name: '应季土鸡蛋',
    price: 22.00,
    stock: 80,
    description: '散养土鸡蛋，新鲜现收，适合日常食用。',
    imgUrl: '',
    createTime: ts(2 * DAY),
    updateTime: ts(2 * DAY),
  },
  {
    id: 3,
    name: '农家蜂蜜',
    price: 45.00,
    stock: 35,
    description: '山地百花蜜，农家采收，味道清甜。',
    imgUrl: '',
    createTime: ts(1 * DAY),
    updateTime: ts(1 * DAY),
  },
]

// ---------------- 工单 ----------------
const WORK_ORDERS = [
  {
    id: 2,
    userId: 3,
    submitterName: '王五',
    title: '村口路灯不亮',
    content: '5组村口那盏路灯坏了好几天了，晚上走路黑乎乎的，老人小孩容易摔跤。',
    category: 2,
    urgency: 2,
    status: 0,
    handleUserId: null,
    handlerName: null,
    result: null,
    createTime: ts(6 * HOUR),
    updateTime: ts(6 * HOUR),
    urgeCount: 0,
  },
  {
    id: 1,
    userId: 3,
    submitterName: '王五',
    title: '垃圾清运不及时',
    content: '3组垃圾桶满了三天没人来拉，天热了味道很大，麻烦安排人来清一下。',
    category: 3,
    urgency: 1,
    status: 1,
    handleUserId: 2,
    handlerName: '李四',
    result: null,
    createTime: ts(3 * DAY),
    updateTime: ts(2 * DAY),
    urgeCount: 1,
  },
  {
    id: 0,
    userId: 3,
    submitterName: '王五',
    title: '村东头水管坏了',
    content: '3组村东头水管破裂，水流了一地，影响好几户村民用水，请尽快来看看。',
    category: 2,
    urgency: 3,
    status: 2,
    handleUserId: 2,
    handlerName: '李四',
    result: '已安排维修人员更换破损管件，当天下午恢复供水。',
    createTime: ts(6 * DAY),
    updateTime: ts(5 * DAY),
    urgeCount: 0,
    evaluateScore: 5,
    evaluateComment: '修得挺快，谢谢李干部！',
  },
]

// 工单流转记录（时间轴）
const WORK_ORDER_LOGS = {
  0: [
    { action: 'submit', actionText: '提交工单', operatorName: '王五', remark: '', createTime: ts(6 * DAY) },
    { action: 'accept', actionText: '村干部已受理', operatorName: '李四', remark: '收到，马上安排人去看', createTime: ts(6 * DAY - 2 * HOUR) },
    { action: 'progress', actionText: '更新处理进度', operatorName: '李四', remark: '已联系维修师傅，下午上门', createTime: ts(6 * DAY - 5 * HOUR) },
    { action: 'finish', actionText: '处理完成', operatorName: '李四', remark: '已更换破损管件，下午3点恢复供水。', createTime: ts(5 * DAY) },
    { action: 'evaluate', actionText: '村民评价：很满意', operatorName: '王五', remark: '修得挺快，谢谢李干部！', createTime: ts(5 * DAY - 1 * HOUR) },
  ],
  1: [
    { action: 'submit', actionText: '提交工单', operatorName: '王五', remark: '', createTime: ts(3 * DAY) },
    { action: 'accept', actionText: '村干部已受理', operatorName: '李四', remark: '知道了，这两天安排车来拉', createTime: ts(3 * DAY - 3 * HOUR) },
    { action: 'progress', actionText: '更新处理进度', operatorName: '李四', remark: '已联系清运车，明天上午来', createTime: ts(2 * DAY) },
  ],
  2: [
    { action: 'submit', actionText: '提交工单', operatorName: '王五', remark: '', createTime: ts(6 * HOUR) },
  ],
}

// ---------------- 村委会联系方式 ----------------
const CONTACTS = [
  { name: '李四', title: '村支书', phone: '13800138001' },
  { name: '村委会值班室', title: '24小时值班', phone: '079188888888' },
]

// ---------------- AI 问答（预置回答） ----------------
const AI_REPLIES = {
  低保: '申请低保需要满足这几个条件：\n\n1. 家庭人均收入低于当地最低生活保障标准\n2. 家庭财产状况符合规定\n\n办理要带的材料：身份证、户口本、收入证明。\n\n您可以带着材料直接到村委会找李四办理，他会帮您填表。\n\n（以上内容仅供参考，具体以村委会解释为准）',
  医保: '2026年度城乡居民医保缴费已经开始了，请在10月底前完成。\n\n缴费方式有两种：\n1. 到村委会现场办理\n2. 让子女在手机上帮您交\n\n忘了交也没关系，来村委会问李四就行。\n\n（以上内容仅供参考，具体以村委会解释为准）',
  补贴: '目前村里的惠农补贴主要有：种粮补贴、农机购置补贴、低保补助。\n\n每项补贴的条件不一样，需要带上身份证和银行卡到村委会登记。\n\n（以上内容仅供参考，具体以村委会解释为准）',
}

const DEFAULT_REPLY = '这个问题我记下来了。为了给您准确的答复，建议您直接问一下村委会，或者点下面的按钮打个电话。\n\n（AI 回答仅供参考，具体政策以村委会解释为准）'

function aiReply(question) {
  const q = String(question || '')
  const keys = Object.keys(AI_REPLIES)
  for (let i = 0; i < keys.length; i++) {
    if (q.indexOf(keys[i]) >= 0) return AI_REPLIES[keys[i]]
  }
  return DEFAULT_REPLY
}

// ---------------- 语音识别模拟文本（插件不可用时兜底，方便走通演示流程） ----------------
const VOICE_SAMPLES = [
  '村口的路灯坏了好几天了，晚上走路看不见，老人容易摔跤',
  '我们组那个垃圾桶满了三天了没人来拉，味道很大',
  '村东头的水管漏水，流了一地，麻烦快来看看',
]

function voiceSample() {
  return VOICE_SAMPLES[Math.floor(Math.random() * VOICE_SAMPLES.length)]
}

// ---------------- 简单的时间轴（提交时自动生成） ----------------
function buildLogs(order) {
  return [
    { action: 'submit', actionText: '提交工单', operatorName: order.submitterName || '我', remark: '', createTime: order.createTime },
  ]
}

// ---------------- Mock 路由 ----------------
function delay(data, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms === undefined ? MOCK_DELAY : ms)
  })
}

function pageOf(list, pageNum, pageSize) {
  const p = Number(pageNum) || 1
  const s = Number(pageSize) || 10
  const start = (p - 1) * s
  const records = list.slice(start, start + s)
  return {
    records,
    total: list.length,
    size: s,
    current: p,
    pages: Math.max(1, Math.ceil(list.length / s)),
  }
}

/**
 * 模拟一次接口请求
 * @returns Promise<data>  （已剥掉 code/msg 外壳，与 request.js 真实分支返回一致）
 */
function mockRequest(url, method, data) {
  const d = data || {}

  // 登录
  if (url === '/user/login') {
    const u = USERS.filter((x) => x.username === d.username)[0]
    if (!u) return Promise.reject({ type: 'BIZ', code: 400, msg: '用户不存在' })
    if (d.password !== '123456') return Promise.reject({ type: 'BIZ', code: 400, msg: '密码错误' })
    return delay({ token: 'mock-token-' + u.id, user: u })
  }

  // 注册
  if (url === '/user/register') {
    if (USERS.filter((x) => x.username === d.username).length) {
      return Promise.reject({ type: 'BIZ', code: 400, msg: '用户名已存在' })
    }
    return delay(null)
  }

  // 通知列表
  if (url === '/notice/page') {
    return delay(pageOf(NOTICES, d.pageNum, d.pageSize))
  }

  // 新增通知
  if (url === '/notice' && method === 'POST') {
    const notice = Object.assign({}, d, {
      id: NOTICES.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      createTime: ts(0),
      isTop: 0,
      isRead: 0,
      publisherName: '村委会',
    })
    NOTICES.unshift(notice)
    return delay(true)
  }

  // 修改通知
  if (url === '/notice' && method === 'PUT') {
    const index = NOTICES.findIndex((item) => item.id === Number(d.id))
    if (index < 0) return Promise.reject({ type: 'BIZ', code: 400, msg: '通知不存在' })
    NOTICES[index] = Object.assign({}, NOTICES[index], d)
    return delay(true)
  }

  // 删除通知
  if (method === 'DELETE' && url.indexOf('/notice/') === 0) {
    const id = Number(url.split('/').pop())
    const index = NOTICES.findIndex((item) => item.id === id)
    if (index < 0) return Promise.reject({ type: 'BIZ', code: 400, msg: '通知不存在' })
    NOTICES.splice(index, 1)
    return delay(true)
  }

  // 通知详情
  if (method === 'GET' && url.indexOf('/notice/') === 0 && url !== '/notice/page') {
    const id = Number(url.split('/').pop())
    const n = NOTICES.filter((x) => x.id === id)[0]
    return n ? delay(n) : Promise.reject({ type: 'BIZ', code: 400, msg: '通知不存在' })
  }

  // 农产品列表
  if (url === '/product/list') {
    return delay(PRODUCTS)
  }

  // 农产品分页列表
  if (url === '/product/page') {
    let list = PRODUCTS
    if (d.name) {
      list = list.filter((x) => x.name.indexOf(d.name) >= 0)
    }
    return delay(pageOf(list, d.pageNum, d.pageSize))
  }

  // 新增农产品
  if (url === '/product' && method === 'POST') {
    const product = Object.assign({}, d, {
      id: PRODUCTS.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      createTime: ts(0),
      updateTime: ts(0),
    })
    PRODUCTS.unshift(product)
    return delay(true)
  }

  // 修改农产品
  if (url === '/product' && method === 'PUT') {
    const index = PRODUCTS.findIndex((item) => item.id === Number(d.id))
    if (index < 0) return Promise.reject({ type: 'BIZ', code: 400, msg: '农产品不存在' })
    PRODUCTS[index] = Object.assign({}, PRODUCTS[index], d, { updateTime: ts(0) })
    return delay(true)
  }

  // 下架农产品
  if (method === 'DELETE' && url.indexOf('/product/') === 0) {
    const id = Number(url.split('/').pop())
    const index = PRODUCTS.findIndex((x) => x.id === id)
    if (index < 0) return Promise.reject({ type: 'BIZ', code: 400, msg: '农产品不存在' })
    PRODUCTS.splice(index, 1)
    return delay(true)
  }

  // 农产品详情
  if (method === 'GET' && url.indexOf('/product/') === 0) {
    const id = Number(url.split('/').pop())
    const product = PRODUCTS.filter((x) => x.id === id)[0]
    return product ? delay(product) : Promise.reject({ type: 'BIZ', code: 400, msg: '农产品不存在' })
  }

  // 工单列表
  if (url === '/workorder/page') {
    let list = WORK_ORDERS
    // 村民只看自己的
    if (d.role === 0 || d.role === undefined) {
      list = list.filter((x) => x.userId === (d.userId || 3))
    }
    if (d.status !== undefined && d.status !== '' && d.status !== null) {
      list = list.filter((x) => x.status === Number(d.status))
    }
    return delay(pageOf(list, d.pageNum, d.pageSize))
  }

  // 工单详情
  if (url === '/workorder/detail') {
    const o = WORK_ORDERS.filter((x) => x.id === Number(d.id))[0]
    if (!o) return Promise.reject({ type: 'BIZ', code: 400, msg: '工单不存在' })
    return delay(o)
  }

  // 村干部处理工单
  if (url === '/workorder/handle' && method === 'PUT') {
    const o = WORK_ORDERS.filter((x) => x.id === Number(d.id))[0]
    if (!o) return Promise.reject({ type: 'BIZ', code: 400, msg: '工单不存在' })
    if (o.status === 2) return Promise.reject({ type: 'BIZ', code: 400, msg: '工单已完成，不能重复处理' })
    o.status = 2
    o.handleUserId = 2
    o.handlerName = '李四'
    o.result = d.result
    o.updateTime = ts(0)
    return delay(true)
  }

  // 工单流转记录
  if (url === '/workorder/logs') {
    return delay(WORK_ORDER_LOGS[Number(d.workOrderId)] || [])
  }

  // 提交工单
  if (url === '/workorder/submit') {
    const newOrder = {
      id: Math.floor(Math.random() * 1000) + 100,
      userId: 3,
      submitterName: '王五',
      title: d.title,
      content: d.content,
      category: d.category || 9,
      urgency: d.urgency || 1,
      status: 0,
      handleUserId: null,
      handlerName: null,
      result: null,
      createTime: ts(0),
      updateTime: ts(0),
      urgeCount: 0,
    }
    WORK_ORDERS.unshift(newOrder)
    WORK_ORDER_LOGS[newOrder.id] = buildLogs(newOrder)
    return delay({ id: newOrder.id })
  }

  // 催办
  if (url === '/workorder/urge') {
    const o = WORK_ORDERS.filter((x) => x.id === Number(d.id))[0]
    if (o) o.urgeCount = (o.urgeCount || 0) + 1
    return delay({ urgeCount: o ? o.urgeCount : 0 })
  }

  // AI 工单智能分析
  if (url === '/ai/workorder/analyze') {
    const text = (d.title || '') + (d.content || '')
    let category = 9
    let urgency = 1
    if (/路灯|水管|电|水|灯|线路/.test(text)) { category = 2; urgency = 2 }
    else if (/垃圾|卫生|污水|味道/.test(text)) { category = 3 }
    else if (/路|桥|道/.test(text)) { category = 1; urgency = 2 }
    else if (/补贴|低保|医保|政策/.test(text)) { category = 6 }
    if (/紧急|危险|塌|漏电|着火/.test(text)) urgency = 3

    return delay({
      category,
      urgency,
      summary: (d.content || d.title || '').slice(0, 40),
      keywords: [],
    })
  }

  // AI 问答
  if (url === '/ai/chat') {
    return delay({ sessionId: d.sessionId || 'mock-session', answer: aiReply(d.question) }, 900)
  }

  // 村委会联系方式
  if (url === '/common/contacts') {
    return delay(CONTACTS)
  }

  // 图片上传
  if (url === '/file/upload') {
    return delay({ url: 'https://placeholder.local/mock.jpg' })
  }

  return Promise.reject({ type: 'BIZ', code: 404, msg: 'mock 未实现的接口：' + url })
}

module.exports = {
  USERS,
  NOTICES,
  WORK_ORDERS,
  CONTACTS,
  PRODUCTS,
  voiceSample,
  aiReply,
  mockRequest,
}
