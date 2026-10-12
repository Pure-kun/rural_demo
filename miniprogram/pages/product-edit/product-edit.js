const request = require('../../utils/request')
const theme = require('../../utils/theme')
const cache = require('../../utils/cache')

Page({
  data: {
    themeClass: 'theme-normal',
    id: '',
    name: '',
    price: '',
    stock: '',
    description: '',
    imgUrl: '',
    imagePath: '',
    loading: false,
    uploading: false,
    saving: false,
  },

  onLoad(options) {
    const id = options.id || ''
    this.setData({ id })
    if (id) this.loadProduct(id)
  },

  onShow() {
    this.setData({ themeClass: theme.getClass() })
  },

  loadProduct(id) {
    this.setData({ loading: true })
    request
      .get('/product/' + id, {}, { silent: true })
      .then((product) => {
        const imagePath = product.imgUrl && product.imgUrl.indexOf('placeholder.local') < 0
          ? product.imgUrl
          : ''
        this.setData({
          name: product.name || '',
          price: String(product.price === undefined || product.price === null ? '' : product.price),
          stock: String(product.stock === undefined || product.stock === null ? '' : product.stock),
          description: product.description || '',
          imgUrl: product.imgUrl || '',
          imagePath,
          loading: false,
        })
      })
      .catch(() => this.setData({ loading: false }))
  },

  onName(e) {
    this.setData({ name: e.detail.value })
  },

  onPrice(e) {
    this.setData({ price: e.detail.value })
  },

  onStock(e) {
    this.setData({ stock: e.detail.value })
  },

  onDescription(e) {
    this.setData({ description: e.detail.value })
  },

  chooseImage() {
    if (this.data.uploading) return
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFiles[0] && res.tempFiles[0].tempFilePath
        if (!filePath) return
        this.setData({ uploading: true })
        request
          .upload(filePath)
          .then((result) => {
            this.setData({
              imagePath: filePath,
              imgUrl: (result && result.url) || '',
              uploading: false,
            })
          })
          .catch(() => {
            this.setData({ uploading: false })
            wx.showToast({ title: '图片上传失败，请重试', icon: 'none' })
          })
      },
    })
  },

  removeImage() {
    this.setData({ imagePath: '', imgUrl: '' })
  },

  save() {
    const { id, name, price, stock, description, imgUrl, saving, uploading } = this.data
    const priceValue = Number(price)
    const stockValue = Number(stock)

    if (saving || uploading) return
    if (!name.trim()) {
      wx.showToast({ title: '请填写农产品名称', icon: 'none' })
      return
    }
    if (price === '' || !Number.isFinite(priceValue) || priceValue < 0) {
      wx.showToast({ title: '请填写正确的价格', icon: 'none' })
      return
    }
    if (stock === '' || !Number.isInteger(stockValue) || stockValue < 0) {
      wx.showToast({ title: '请填写正确的库存数量', icon: 'none' })
      return
    }

    const product = {
      name: name.trim(),
      price: priceValue,
      stock: stockValue,
      description: description.trim(),
      imgUrl,
    }
    if (id) product.id = Number(id)

    this.setData({ saving: true })
    const saveRequest = id
      ? request({ url: '/product', method: 'PUT', data: product, loading: true })
      : request.post('/product', product, { loading: true, queueable: false })

    saveRequest
      .then(() => {
        cache.remove('product_list')
        wx.showToast({ title: id ? '修改成功' : '上架成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 500)
      })
      .catch(() => this.setData({ saving: false }))
  },
})
