const request = require('../../utils/request')
const theme = require('../../utils/theme')
const format = require('../../utils/format')

Page({
  data: {
    themeClass: 'theme-normal',
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

  load() {
    this.setData({ loading: true })
    return request
      .get('/notice/page', { pageNum: 1, pageSize: 20 }, { silent: true, cacheKey: 'notice_list' })
      .then((page) => {
        const list = ((page && page.records) || []).map((n) =>
          Object.assign({}, n, { timeText: format.oralTime(n.createTime) })
        )
        this.setData({ list, loading: false })
      })
      .catch(() => this.setData({ loading: false }))
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/notice-detail/notice-detail?id=' + id })
  },
})
