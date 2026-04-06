// pages/activity-type/activity-type.js
const api = require('../../utils/api')

Page({
  data: {
    activityTypes: [],
    selected: ''
  },

  _callback: null,

  onLoad(options) {
    const { activityTypes } = api.getEnums()
    this.setData({
      activityTypes,
      selected: options.current || ''
    })

    // 获取事件通道
    const eventChannel = this.getOpenerEventChannel()
    this._callback = (type, typeInfo) => {
      eventChannel.emit('typeSelected', { type, typeInfo })
    }
  },

  onSelect(e) {
    const type = e.currentTarget.dataset.type
    const { activityTypes } = this.data
    const typeInfo = activityTypes.find(t => t.value === type)
    this.setData({ selected: type })

    setTimeout(() => {
      if (this._callback) this._callback(type, typeInfo)
      wx.navigateBack()
    }, 200)
  }
})
