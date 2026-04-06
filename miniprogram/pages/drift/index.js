// pages/drift/index.js
const api = require('../../utils/api')

Page({
  data: {
    quota: { canThrow: true, canFish: true, throwRemain: 1, fishRemain: 1 },
    thrown: [],
    fished: [],
    loadingHistory: false,
    fishing: false,
    waving: false
  },

  async onLoad() {
    await this._loadAll()
    // 瓶子晃动动画循环
    setInterval(() => {
      this.setData({ waving: true })
      setTimeout(() => this.setData({ waving: false }), 1000)
    }, 3000)
  },

  onShow() {
    this._loadAll()
  },

  async _loadAll() {
    this.setData({ loadingHistory: true })
    try {
      const user = await api.getCurrentUser()
      const [quota, history] = await Promise.all([
        api.getDriftQuotaStatus(user._id),
        api.getMyBottles(user._id)
      ])
      this.setData({
        quota,
        thrown: history.thrown,
        fished: history.fished,
        currentUserId: user._id
      })
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    } finally {
      this.setData({ loadingHistory: false })
    }
  },

  onThrow() {
    if (!this.data.quota.canThrow) {
      wx.showToast({ title: '今日丢瓶次数已用完', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/drift/throw' })
  },

  async onFish() {
    if (!this.data.quota.canFish) {
      wx.showToast({ title: '今日捞瓶次数已用完', icon: 'none' })
      return
    }
    this.setData({ fishing: true })
    try {
      const bottle = await api.fishBottle(this.data.currentUserId)
      wx.navigateTo({
        url: `/pages/drift/chat?bottleId=${bottle._id}&role=fisher`
      })
    } catch (e) {
      wx.showToast({ title: e.message || '捞瓶失败', icon: 'none' })
    } finally {
      this.setData({ fishing: false })
    }
  },

  onBottleCardTap(e) {
    const bottle = e.currentTarget.dataset.bottle
    if (bottle.status === 'waiting') {
      wx.showToast({ title: '等待他人捞起中...', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/drift/chat?bottleId=${bottle._id}&role=thrower`
    })
  }
})
