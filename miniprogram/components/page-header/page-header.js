/**
 * 页面通用头部（全站范式）
 * 结构：柔和渐变曲线背景 + 居中悬浮图标卡片 + 居中标题/副标题
 *
 * 用法：
 * <page-header icon="📋" title="我的工单" subtitle="..." theme="green" />
 * theme: green | orange | purple | blue
 * customNav: 页面用了自定义导航栏时传 true，会自动加上状态栏高度
 * compact: 紧凑模式（聊天页等空间紧张的场景）
 */
Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    icon: { type: String, value: '🏡' },
    title: { type: String, value: '' },
    subtitle: { type: String, value: '' },
    theme: { type: String, value: 'green' },
    customNav: { type: Boolean, value: false },
    compact: { type: Boolean, value: false },
    showCard: { type: Boolean, value: true },
  },

  data: {
    curveHeight: 96,
  },

  lifetimes: {
    attached() {
      this.computeHeight()
    },
  },

  observers: {
    'customNav, compact': function () {
      this.computeHeight()
    },
  },

  methods: {
    computeHeight() {
      let statusBarHeight = 0
      if (this.data.customNav) {
        try {
          statusBarHeight = wx.getSystemInfoSync().statusBarHeight || 20
        } catch (e) {
          statusBarHeight = 20
        }
      }
      const base = this.data.compact ? 72 : 96
      this.setData({ curveHeight: statusBarHeight + base })
    },
  },
})
