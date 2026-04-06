// pages/index/index.js
const api = require('../../utils/api')
const util = require('../../utils/util')

const TABS = [
  { value: 'all', label: '全部', count: 0 },
  { value: 'mine', label: '我发起', count: 0 },
  { value: 'joined', label: '我参与', count: 0 }
]

const EMPTY_TEXT = {
  all: '还没有活动，发起第一个吧~',
  mine: '还没有发起过活动',
  joined: '还没有参与过活动'
}

Page({
  data: {
    tabs: TABS,
    activeTab: 'all',
    activities: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    noMore: false,
    emptyText: EMPTY_TEXT.all,
    currentUserId: '',
    driftFishRemain: 1
  },

  async onLoad() {
    const userInfo = await api.getCurrentUser()
    this.setData({ currentUserId: userInfo._id })
    await Promise.all([
      this._loadActivities(),
      this._loadDriftQuota(userInfo._id)
    ])
  },

  onShow() {
    // 从创建页返回时刷新列表
    if (this._needRefresh) {
      this._needRefresh = false
      this._loadActivities()
    }
    // 每次显示时刷新漂流瓶配额
    if (this.data.currentUserId) {
      this._loadDriftQuota(this.data.currentUserId)
    }
  },

  async _loadDriftQuota(userId) {
    try {
      const quota = await api.getDriftQuotaStatus(userId)
      this.setData({ driftFishRemain: quota.fishRemain })
    } catch (_) {}
  },

  async _loadActivities() {
    this.setData({ loading: true })
    try {
      const { activeTab, currentUserId } = this.data
      const list = await api.getActivities({ tab: activeTab, currentUserId })
      this.setData({ activities: list, noMore: true })
      this._updateTabCounts()
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'error' })
    } finally {
      this.setData({ loading: false, refreshing: false })
    }
  },

  async _updateTabCounts() {
    const { currentUserId } = this.data
    const [all, mine, joined] = await Promise.all([
      api.getActivities({ tab: 'all', currentUserId }),
      api.getActivities({ tab: 'mine', currentUserId }),
      api.getActivities({ tab: 'joined', currentUserId })
    ])
    this.setData({
      tabs: [
        { value: 'all', label: '全部', count: 0 },
        { value: 'mine', label: '我发起', count: mine.length },
        { value: 'joined', label: '我参与', count: joined.length }
      ]
    })
  },

  onTabChange(e) {
    const value = e.currentTarget.dataset.value
    if (value === this.data.activeTab) return
    this.setData({
      activeTab: value,
      activities: [],
      emptyText: EMPTY_TEXT[value] || EMPTY_TEXT.all
    })
    this._loadActivities()
  },

  onRefresh() {
    this.setData({ refreshing: true })
    this._loadActivities()
  },

  onLoadMore() {
    // MVP 阶段 mock 数据量小，无分页
  },

  onCardTap(e) {
    const { activity } = e.detail
    wx.navigateTo({
      url: `/pages/detail/detail?id=${activity._id}`
    })
  },

  onCreateTap() {
    wx.navigateTo({
      url: '/pages/create/create',
      events: {
        activityCreated: () => {
          this._needRefresh = true
        }
      }
    })
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' })
  },

  onDriftTap() {
    wx.navigateTo({ url: '/pages/drift/index' })
  }
})
