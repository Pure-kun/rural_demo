/**
 * 文案格式化
 * 适老化要点：时间说"今天早上7点"，状态说"等干部处理"，不用行业黑话
 */

// ---------- 时间 ----------
function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

function toDate(str) {
  if (!str) return null
  // iOS 不能解析 "2026-09-13 07:08:33"，必须换成斜杠
  const d = new Date(String(str).replace(/-/g, '/').replace('T', ' '))
  return isNaN(d.getTime()) ? null : d
}

/**
 * 口语化时间：今天早上7点 / 9月13日下午3点
 */
function oralTime(str) {
  const d = toDate(str)
  if (!d) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()

  const h = d.getHours()
  const period = h < 6 ? '凌晨' : h < 12 ? '早上' : h < 14 ? '中午' : h < 18 ? '下午' : '晚上'
  const h12 = h % 12 === 0 ? 12 : h % 12

  if (sameDay) return '今天' + period + h12 + '点'
  return (d.getMonth() + 1) + '月' + d.getDate() + '日' + period + h12 + '点'
}

/**
 * 标准时间：今天 07:08 / 9月13日 07:08
 */
function shortTime(str) {
  const d = toDate(str)
  if (!d) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const hm = pad(d.getHours()) + ':' + pad(d.getMinutes())
  if (sameDay) return '今天 ' + hm
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + hm
}

/**
 * 完整时间：2026-09-13 07:08
 */
function fullTime(str) {
  const d = toDate(str)
  if (!d) return ''
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

// ---------- 工单状态 ----------
// 以后端当前定义为准：0待处理 1处理中 2已完成
// 3/4/5 为闭环管控升级预留（后端升级后即可直接显示）
const STATUS = {
  0: { short: '待处理', oral: '等干部处理', icon: '⏳', tag: 'tag-pending' },
  1: { short: '处理中', oral: '正在处理中', icon: '🔧', tag: 'tag-processing' },
  2: { short: '已完成', oral: '已经办好了', icon: '✅', tag: 'tag-done' },
  3: { short: '待评价', oral: '处理完啦，请您评价', icon: '⭐', tag: 'tag-evaluate' },
  4: { short: '已完结', oral: '已经办好了', icon: '✅', tag: 'tag-done' },
  5: { short: '已关闭', oral: '已关闭', icon: '🚫', tag: 'tag-closed' },
}

function statusInfo(status) {
  return STATUS[status] || { short: '未知', oral: '未知', icon: '❓', tag: 'tag-closed' }
}

function statusText(status, oral) {
  const s = statusInfo(status)
  return oral ? s.oral : s.short
}

// ---------- 分类 ----------
const CATEGORY = {
  1: '道路出行',
  2: '水电设施',
  3: '环境卫生',
  4: '邻里纠纷',
  5: '农业生产',
  6: '政策咨询',
  9: '其他',
}

function categoryText(c) {
  return CATEGORY[c] || '其他'
}

// ---------- 紧急程度 ----------
const URGENCY = {
  1: { text: '一般', color: '#5A5A5A' },
  2: { text: '较急', color: '#E8820C' },
  3: { text: '紧急', color: '#C7362F' },
}

function urgencyInfo(u) {
  return URGENCY[u] || URGENCY[1]
}

// ---------- 角色 ----------
function roleText(role) {
  return role === 1 ? '村干部' : '村民'
}

module.exports = {
  oralTime,
  shortTime,
  fullTime,
  statusInfo,
  statusText,
  STATUS,
  categoryText,
  CATEGORY,
  urgencyInfo,
  roleText,
}
