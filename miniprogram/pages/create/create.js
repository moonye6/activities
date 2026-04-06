// pages/create/create.js
const api = require('../../utils/api')
const util = require('../../utils/util')

// 生成时间范围选择器的数据
function genTimeRange() {
  const dates = []
  const hours = []
  const minutes = ['00', '15', '30', '45']
  const now = new Date()

  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
    const m = d.getMonth() + 1
    const day = d.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const wd = weekdays[d.getDay()]
    let label = ''
    if (i === 0) label = `今天 (${m}/${day})`
    else if (i === 1) label = `明天 (${m}/${day})`
    else label = `${m}月${day}日 周${wd}`
    dates.push({ label, value: `${d.getFullYear()}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}` })
  }

  for (let h = 0; h < 24; h++) {
    hours.push(String(h).padStart(2, '0'))
  }

  return [dates.map(d => d.label), hours, minutes]
}

Page({
  data: {
    form: {
      title: '',
      type: '',
      time: '',
      location: '',
      visibility: 'friends',
      tags: [],
      maxCount: 6
    },
    typeInfo: {},
    visibilityOptions: [],
    systemTags: [],
    customTags: [],
    timeRange: [],
    timePickerVal: [0, 19, 0],
    submitting: false
  },

  _dateRange: [],

  onLoad() {
    const { activityTypes, visibilityOptions, systemTags } = api.getEnums()
    const timeRange = genTimeRange()
    this._dateRange = []

    const now = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const m = d.getMonth() + 1
      const day = d.getDate()
      this._dateRange.push(
        `${d.getFullYear()}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      )
    }

    this.setData({
      // 每次进入重置表单
      form: {
        title: '',
        type: '',
        time: '',
        location: '',
        visibility: 'friends',
        tags: [],
        maxCount: 6
      },
      typeInfo: {},
      customTags: [],
      visibilityOptions,
      systemTags,
      timeRange,
      timePickerVal: [0, 19, 0]
    })

    this._updateTimeDisplay(0, 19, 0)
  },

  _updateTimeDisplay(dateIdx, hourIdx, minIdx) {
    const date = this._dateRange[dateIdx] || ''
    const hour = String(hourIdx).padStart(2, '0')
    const min = ['00', '15', '30', '45'][minIdx] || '00'
    const time = `${date} ${hour}:${min}`
    this.setData({ 'form.time': time })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onSelectType() {
    wx.navigateTo({
      url: '/pages/activity-type/activity-type',
      events: {
        typeSelected: (data) => {
          this.setData({
            'form.type': data.type,
            typeInfo: data.typeInfo
          })
        }
      }
    })
  },

  onTimeChange(e) {
    const [dateIdx, hourIdx, minIdx] = e.detail.value
    this.setData({ timePickerVal: [dateIdx, hourIdx, minIdx] })
    this._updateTimeDisplay(dateIdx, hourIdx, minIdx)
  },

  onVisibilityChange(e) {
    this.setData({ 'form.visibility': e.currentTarget.dataset.value })
  },

  onCountChange(e) {
    const action = e.currentTarget.dataset.action
    let count = this.data.form.maxCount
    if (action === 'plus') count = Math.min(50, count + 1)
    if (action === 'minus') count = Math.max(2, count - 1)
    this.setData({ 'form.maxCount': count })
  },

  onTagChange(e) {
    this.setData({ 'form.tags': e.detail.selected })
  },

  onCustomTagChange(e) {
    this.setData({ customTags: e.detail.customTags })
  },

  async onSubmit() {
    const { form } = this.data
    if (!form.title.trim()) {
      wx.showToast({ title: '请填写活动名称', icon: 'none' })
      return
    }
    if (!form.type) {
      wx.showToast({ title: '请选择活动类型', icon: 'none' })
      return
    }
    if (!form.time) {
      wx.showToast({ title: '请选择活动时间', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      const userInfo = await api.getCurrentUser()
      const activity = await api.createActivity({
        ...form,
        title: form.title.trim(),
        location: form.location.trim(),
        creatorId: userInfo._id
      })

      wx.showToast({ title: '发起成功 🎉', icon: 'none' })

      // 通知上一页刷新
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage._needRefresh !== undefined) {
        prevPage._needRefresh = true
      }

      setTimeout(() => {
        wx.navigateBack()
        // 跳转到详情页
        wx.navigateTo({ url: `/pages/detail/detail?id=${activity._id}` })
      }, 800)
    } catch (e) {
      wx.showToast({ title: '发布失败，请重试', icon: 'error' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
