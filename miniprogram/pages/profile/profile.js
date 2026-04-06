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
    joinedAt: '',
    editingNick: false,
    nickNameInput: ''
  },

  async onLoad() {
    await this._loadProfile()
  },

  onShow() {
    this._loadProfile()
  },

  async _loadProfile() {
    try {
      // 每次都从数据库重新拉取，确保昵称/头像是最新的
      const userInfo = await api.refreshCurrentUser()
      const [stats, allActivities] = await Promise.all([
        api.getUserStats(userInfo._id),
        api.getActivities({ tab: 'all', currentUserId: userInfo._id })
      ])

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
          let roleLabel = '', roleColor = ''
          if (isCreator) {
            roleLabel = '我发起'; roleColor = '#FF6B35'
          } else if (myRsvp) {
            const info = util.mapRsvpStatus(myRsvp.status)
            roleLabel = `我${info.label}`; roleColor = info.color
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
      console.error(e)
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  // ---- 头像授权（同时保存昵称）----
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    if (!avatarUrl) return
    // 昵称：微信自动填入 nickname input 后触发 bindinput 缓存到 nickNameInput
    const nickName = this.data.nickNameInput || this.data.userInfo.nickName
    wx.showLoading({ title: '保存中...' })
    try {
      const userInfo = await api.getCurrentUser()
      // 上传头像到云存储
      const ext = avatarUrl.split('.').pop().split('?')[0] || 'jpg'
      const cloudPath = `avatars/${userInfo._id}.${ext}`
      const { fileID } = await wx.cloud.uploadFile({ cloudPath, filePath: avatarUrl })
      // 同时更新头像和昵称
      const updateData = { avatarUrl: fileID }
      if (nickName && nickName !== '新用户') {
        updateData.nickName = nickName
      }
      await api.updateUserInfo(userInfo._id, updateData)
      // 同步 globalData 和页面
      const app = getApp()
      app.globalData.userInfo = { ...app.globalData.userInfo, ...updateData }
      this.setData({
        'userInfo.avatarUrl': fileID,
        ...(updateData.nickName ? {
          'userInfo.nickName': updateData.nickName,
          avatarText: util.avatarPlaceholder(updateData.nickName)
        } : {})
      })
      wx.showToast({ title: '授权成功', icon: 'success' })
    } catch (err) {
      console.error('授权失败', err)
      wx.showToast({ title: '授权失败：' + (err.errMsg || err.message || ''), icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  // ---- 昵称编辑 ----
  onEditNick() {
    this.setData({ editingNick: true, nickNameInput: this.data.userInfo.nickName })
  },

  onNickInput(e) {
    this.setData({ nickNameInput: e.detail.value })
  },

  onNickInput(e) {
    // bindinput 实时缓存，微信昵称填充后会触发此事件
    this.setData({ nickNameInput: e.detail.value })
    console.log('[nickInput]', e.detail.value)
  },

  async onNickBlur(e) {
    const val = (e.detail && e.detail.value) ? e.detail.value : this.data.nickNameInput
    console.log('[nickBlur] val:', val)
    await this._saveNick(val)
  },

  async onNickConfirm(e) {
    const val = (e.detail && e.detail.value) ? e.detail.value : this.data.nickNameInput
    console.log('[nickConfirm] val:', val)
    await this._saveNick(val)
  },

  // 确认按钮：直接用缓存的 nickNameInput
  async onNickConfirmBtn() {
    const val = this.data.nickNameInput
    console.log('[nickConfirmBtn] val:', val)
    await this._saveNick(val)
  },

  async _saveNick(nickName) {
    nickName = (nickName || '').trim()
    console.log('[_saveNick] nickName:', nickName)
    if (!nickName || (nickName === this.data.userInfo.nickName && nickName !== '新用户')) {
      console.log('[_saveNick] skip, same or empty')
      this.setData({ editingNick: false })
      return
    }
    try {
      const userInfo = await api.getCurrentUser()
      console.log('[_saveNick] userId:', userInfo._id)
      const res = await api.updateUserInfo(userInfo._id, { nickName })
      console.log('[_saveNick] update result:', JSON.stringify(res))
      const app = getApp()
      app.globalData.userInfo = { ...app.globalData.userInfo, nickName }
      this.setData({
        'userInfo.nickName': nickName,
        avatarText: util.avatarPlaceholder(nickName),
        editingNick: false
      })
      wx.showToast({ title: '昵称已更新', icon: 'success' })
    } catch (err) {
      console.error('[_saveNick] error:', err)
      wx.showToast({ title: '更新失败：' + (err.message || err.errMsg || '未知错误'), icon: 'none' })
      this.setData({ editingNick: false })
    }
  },

  onActivityTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
