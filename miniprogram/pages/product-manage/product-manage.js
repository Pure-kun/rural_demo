const request = require('../../utils/request')
const theme = require('../../utils/theme')
const cache = require('../../utils/cache')

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
      .get('/product/page', { pageNum: 1, pageSize: 50 }, { silent: true })
      .then((page) => {
        const list = ((page && page.records) || []).map((product) => Object.assign({}, product, {
          imageSrc: product.imgUrl && product.imgUrl.indexOf('placeholder.local') < 0 ? product.imgUrl : '',
        }))
        this.setData({ list, loading: false })
      })
      .catch(() => this.setData({ loading: false }))
  },

  addProduct() {
    wx.navigateTo({ url: '/pages/product-edit/product-edit' })
  },

  editProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/product-edit/product-edit?id=' + id })
  },

  removeProduct(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    wx.showModal({
      title: '确认下架',
      content: '确定要下架“' + name + '”吗？',
      confirmText: '下架',
      confirmColor: '#C7362F',
      success: (res) => {
        if (!res.confirm) return
        request({
          url: '/product/' + id,
          method: 'DELETE',
          loading: true,
        })
          .then(() => {
            cache.remove('product_list')
            wx.showToast({ title: '已下架', icon: 'success' })
            this.load()
          })
          .catch(() => {})
      },
    })
  },
})
