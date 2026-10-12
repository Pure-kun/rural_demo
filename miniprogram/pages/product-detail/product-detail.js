const request = require('../../utils/request')
const theme = require('../../utils/theme')

Page({
  data: {
    themeClass: 'theme-normal',
    id: null,
    product: null,
    loading: true,
  },

  onLoad(options) {
    this.setData({ id: options.id })
    this.load()
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  load() {
    request
      .get('/product/' + this.data.id, {}, { silent: true })
      .then((product) => {
        product.imageSrc = product.imgUrl && product.imgUrl.indexOf('placeholder.local') < 0 ? product.imgUrl : ''
        this.setData({ product, loading: false })
      })
      .catch(() => this.setData({ loading: false }))
  },
})
