const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')

const TABS = [
  { key: '', label: '全部' },
  { key: 0, label: '待处理' },
  { key: 1, label: '处理中' },
  { key: 2, label: '已完成' },
]

Page({
  data: {
    themeClass: 'theme-normal',
    tabs: TABS,
    activeTab: '',
    list: [],
    loading: true,
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh())
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, () => this.load())
  },

  load() {
    const params = { role: 1, pageNum: 1, pageSize: 50 }
    if (this.data.activeTab !== '') params.status = this.data.activeTab
    this.setData({ loading: true })

    return request
      .get('/workorder/page', params, { silent: true })
      .then((page) => {
        const list = ((page && page.records) || []).map((order) => {
          const status = format.statusInfo(order.status)
          return Object.assign({}, order, {
            statusText: status.short,
            statusIcon: status.icon,
            statusTag: status.tag,
            categoryText: format.categoryText(order.category),
            urgencyText: format.urgencyInfo(order.urgency).text,
            timeText: format.oralTime(order.createTime),
          })
        })
        this.setData({ list, loading: false })
      })
      .catch(() => this.setData({ loading: false }))
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/cadre-workorder-detail/cadre-workorder-detail?id=' + id })
  },
})
