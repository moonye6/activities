// pages/profile/profile.js
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    userInfo: {},
    stats: { created: 0, joined: 0, ended: 0 },
    myActivities: [],
    avatarText: '',
    avatarColor: '',
    joinedAt: ''
  },

  async onLoad() {
    await this._loadProfile()
  },

  onShow() {
    // 每次显示时刷新数据
    this._loadProfile()
  },

  async _loadProfile() {
    try {
      const userInfo = await api.getCurrentUser()
      const [stats, allActivities] = await Promise.all([
        api.getUserStats(userInfo._id),
        api.getActivities({ tab: 'all', currentUserId: userInfo._id })
      ])

      // 我相关的活动（发起或参与）
      const myActivities = allActivities
        .filter(a =>
          a.creatorId === userInfo._id ||
          a.rsvps.some(r => r.userId === userInfo._id)
        )
        .map(a => {
          const typeInfo = util.mapActivityType(a.type)
          const statusInfo = util.mapActivityStatus(a.status)
          const timeLabel = util.formatTime(a.time)
          const isCreator = a.creatorId === userInfo._id
          const myRsvp = a.rsvps.find(r => r.userId === userInfo._id)
          let roleLabel = ''
          let roleColor = ''
          if (isCreator) {
            roleLabel = '我发起'
            roleColor = '#FF6B35'
          } else if (myRsvp) {
            const info = util.mapRsvpStatus(myRsvp.status)
            roleLabel = `我${info.label}`
            roleColor = info.color
          }
          return { ...a, typeInfo, statusInfo, timeLabel, roleLabel, roleColor }
        })

      this.setData({
        userInfo,
        stats,
        myActivities,
        avatarText: util.avatarPlaceholder(userInfo.nickName),
        avatarColor: util.avatarColor(userInfo._id),
        joinedAt: util.formatTimestamp(userInfo.createdAt, 'date')
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  onActivityTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
