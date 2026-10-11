const app = getApp()
const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')
const network = require('../../utils/network')

const TABS = [
  { key: '', label: '全部' },
  { key: 0, label: '等干部处理' },
  { key: 1, label: '正在处理' },
  { key: 2, label: '已经办好' },
]

Page({
  data: {
    themeClass: 'theme-normal',
    tabs: TABS,
    activeTab: '',
    list: [],
    loading: true,
    isOnline: true,
    isCached: false,
  },

  onShow() {
    this.setData({
      themeClass: theme.getClass(),
      isOnline: network.isOnline(),
    })
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh())
  },

  switchTab(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ activeTab: key }, () => this.load())
  },

  load() {
    const user = app.globalData.userInfo || {}
    const { activeTab } = this.data

    this.setData({ loading: true })

    const params = {
      userId: user.id || 3,
      role: user.role === undefined ? 0 : user.role,
      pageNum: 1,
      pageSize: 20,
    }
    if (activeTab !== '') params.status = activeTab

    return request
      .get('/workorder/page', params, {
        silent: true,
        cacheKey: 'wo_list_' + (user.id || 3) + '_' + activeTab,
        cacheTTL: 5 * 60 * 1000,
        loading: false,
      })
      .then((page) => {
        const list = ((page && page.records) || []).map((o) =>
          Object.assign({}, o, {
            statusText: format.statusText(o.status),
            statusIcon: format.statusInfo(o.status).icon,
            statusTag: format.statusInfo(o.status).tag,
            timeText: format.oralTime(o.createTime),
            categoryText: format.categoryText(o.category),
          })
        )
        this.setData({ list, loading: false, isCached: !network.isOnline() })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/workorder-detail/workorder-detail?id=' + id })
  },

  goSubmit() {
    wx.navigateTo({ url: '/pages/workorder-submit/workorder-submit' })
  },
})
