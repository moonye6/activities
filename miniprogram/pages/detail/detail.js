// pages/detail/detail.js
const api = require('../../utils/api')
const util = require('../../utils/util')

// 封面渐变色映射
const COVER_GRADIENTS = {
  dinner: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
  sport:  'linear-gradient(135deg, #34C759 0%, #5BD07D 100%)',
  party:  'linear-gradient(135deg, #FF9500 0%, #FFB340 100%)',
  movie:  'linear-gradient(135deg, #007AFF 0%, #5AA6FF 100%)',
  course: 'linear-gradient(135deg, #AF52DE 0%, #C77EF0 100%)',
  other:  'linear-gradient(135deg, #8E8E93 0%, #AEAEB2 100%)'
}

Page({
  data: {
    activity: null,
    loading: true,
    typeInfo: {},
    statusInfo: {},
    timeLabel: '',
    visibilityLabel: '',
    rsvpCounts: { yes: 0, maybe: 0, no: 0 },
    progressPct: 0,
    participants: [],
    myRsvp: null,
    isCreator: false,
    creatorInfo: {},
    createdAtLabel: '',
    coverGradient: COVER_GRADIENTS.other,
    currentUserId: ''
  },

  _actId: '',

  async onLoad(options) {
    this._actId = options.id
    wx.setNavigationBarTitle({ title: '活动详情' })

    const userInfo = await api.getCurrentUser()
    this.setData({ currentUserId: userInfo._id })
    await this._loadActivity()
  },

  async _loadActivity() {
    this.setData({ loading: true })
    try {
      const activity = await api.getActivityById(this._actId)
      if (!activity) {
        this.setData({ loading: false })
        return
      }

      const { currentUserId } = this.data
      const typeInfo = util.mapActivityType(activity.type)
      const statusInfo = util.mapActivityStatus(activity.status)
      const timeLabel = util.formatTime(activity.time)
      const visibilityLabel = util.mapVisibility(activity.visibility)
      const rsvpCounts = util.countRsvps(activity.rsvps)
      const progressPct = activity.maxCount > 0
        ? Math.min(100, Math.round((rsvpCounts.yes / activity.maxCount) * 100))
        : 0
      const myRsvpObj = activity.rsvps.find(r => r.userId === currentUserId)
      const myRsvp = myRsvpObj ? myRsvpObj.status : null
      const isCreator = activity.creatorId === currentUserId
      const coverGradient = COVER_GRADIENTS[activity.type] || COVER_GRADIENTS.other
      const createdAtLabel = util.formatTimestamp(activity.createdAt, 'relative')

      // 加载参与者信息
      const participantIds = activity.rsvps.map(r => r.userId)
      const users = await api.getUsersByIds(participantIds)
      const participants = activity.rsvps.map(r => {
        const user = users.find(u => u._id === r.userId) || { _id: r.userId, nickName: '未知用户' }
        return {
          userId: r.userId,
          nickName: user.nickName,
          avatarText: util.avatarPlaceholder(user.nickName),
          avatarColor: util.avatarColor(r.userId),
          statusInfo: util.mapRsvpStatus(r.status),
          status: r.status
        }
      })

      // 加载创建者
      const creator = await api.getUserById(activity.creatorId)
      const creatorInfo = creator ? {
        nickName: creator.nickName,
        avatarText: util.avatarPlaceholder(creator.nickName),
        avatarColor: util.avatarColor(creator._id)
      } : { nickName: '未知用户', avatarText: '?', avatarColor: '#AAAAAA' }

      wx.setNavigationBarTitle({ title: activity.title })

      this.setData({
        activity,
        loading: false,
        typeInfo,
        statusInfo,
        timeLabel,
        visibilityLabel,
        rsvpCounts,
        progressPct,
        participants,
        myRsvp,
        isCreator,
        coverGradient,
        createdAtLabel,
        creatorInfo
      })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  async onRsvp(e) {
    const status = e.currentTarget.dataset.status
    const { currentUserId, myRsvp } = this.data

    // 取消操作：再次点击相同状态则取消（在 mock 中用 'no' 覆盖？这里保持直接更新）
    if (status === myRsvp) return  // 状态相同不重复请求

    wx.showLoading({ title: '提交中...' })
    try {
      await api.updateRsvp(this._actId, currentUserId, status)
      wx.showToast({
        title: status === 'yes' ? '已确认参加 ✓' : status === 'maybe' ? '已标记暂定' : '已婉拒',
        icon: 'none'
      })
      await this._loadActivity()
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'error' })
    } finally {
      wx.hideLoading()
    }
  }
})
