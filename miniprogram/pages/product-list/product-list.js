const request = require('../../utils/request')
const theme = require('../../utils/theme')

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
      .get('/product/list', {}, { silent: true, cacheKey: 'product_list' })
      .then((list) => {
        const products = (list || []).map((product) => Object.assign({}, product, {
          imageSrc: product.imgUrl && product.imgUrl.indexOf('placeholder.local') < 0 ? product.imgUrl : '',
        }))
        this.setData({ list: products, loading: false })
      })
      .catch(() => this.setData({ loading: false }))
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/product-detail/product-detail?id=' + id })
  },
})
