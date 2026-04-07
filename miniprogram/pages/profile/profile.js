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
    nickNameInput: '',
    // 属性编辑相关
    genderOptions: [],
    genderLabel: '',
    editingCompany: false,
    editingSchool: false,
    companyInput: '',
    schoolInput: '',
    // 结构化标签展示
    displayTags: []
  },

  async onLoad() {
    const { genderOptions, systemTags } = api.getEnums()
    this.setData({ genderOptions })
    this._systemTags = systemTags
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

      // 构建展示标签
      const systemTags = this._systemTags || []
      const displayTags = (userInfo.tags || []).map(key => {
        const def = systemTags.find(t => t.key === key)
        if (def) {
          let hint = ''
          if (def.category === 'identity' && def.matchMode === 'exact') {
            hint = userInfo[def.matchField] || '未设置'
          }
          return { key, label: def.label, isIdentity: def.category === 'identity', hint, icon: def.icon || '' }
        }
        return { key, label: key, isIdentity: false, hint: '', icon: '' }
      })

      // 性别文案
      const genderMap = { male: '男', female: '女', other: '其他' }
      const genderLabel = genderMap[userInfo.gender] || '未设置'

      this.setData({
        userInfo,
        stats,
        myActivities,
        avatarText: util.avatarPlaceholder(userInfo.nickName),
        avatarColor: util.avatarColor(userInfo._id),
        joinedAt: util.formatTimestamp(userInfo.createdAt, 'date'),
        genderLabel,
        companyInput: userInfo.company || '',
        schoolInput: userInfo.school || '',
        displayTags
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

  // ---- 属性编辑：性别 ----
  onGenderChange(e) {
    const idx = e.detail.value
    const option = this.data.genderOptions[idx]
    if (!option) return
    this._saveField('gender', option.value, option.label)
  },

  // ---- 属性编辑：公司 ----
  onEditCompany() {
    this.setData({ editingCompany: true, companyInput: this.data.userInfo.company || '' })
  },

  onCompanyInput(e) {
    this.setData({ companyInput: e.detail.value })
  },

  onCompanyConfirm() {
    const val = this.data.companyInput.trim()
    this.setData({ editingCompany: false })
    if (val === (this.data.userInfo.company || '')) return
    this._saveField('company', val)
  },

  // ---- 属性编辑：学校 ----
  onEditSchool() {
    this.setData({ editingSchool: true, schoolInput: this.data.userInfo.school || '' })
  },

  onSchoolInput(e) {
    this.setData({ schoolInput: e.detail.value })
  },

  onSchoolConfirm() {
    const val = this.data.schoolInput.trim()
    this.setData({ editingSchool: false })
    if (val === (this.data.userInfo.school || '')) return
    this._saveField('school', val)
  },

  // ---- 通用保存字段 ----
  async _saveField(field, value, displayValue) {
    try {
      const userInfo = await api.getCurrentUser()
      await api.updateUserInfo(userInfo._id, { [field]: value })
      const app = getApp()
      app.globalData.userInfo = { ...app.globalData.userInfo, [field]: value }
      this.setData({ [`userInfo.${field}`]: value })

      if (field === 'gender') {
        this.setData({ genderLabel: displayValue || value })
      }

      wx.showToast({ title: '已更新', icon: 'success' })
      // 刷新标签显示
      this._loadProfile()
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'error' })
    }
  },

  onActivityTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
