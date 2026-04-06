// pages/drift/chat.js
const api = require('../../utils/api')
const sensitive = require('../../utils/sensitive')

function formatTime(ts) {
  const d = new Date(ts)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

Page({
  data: {
    bottleId: '',
    role: 'fisher',   // 'thrower' | 'fisher'
    bottle: {},
    messages: [],
    inputText: '',
    loading: false,
    currentUserId: '',
    scrollTo: 'msg-bottom'
  },

  _pollTimer: null,

  async onLoad(options) {
    const { bottleId, role } = options
    this.setData({ bottleId, role, loading: true })

    const user = await api.getCurrentUser()
    this.setData({ currentUserId: user._id })

    await this._loadBottle()
    await this._loadMessages()

    // 轮询新消息（每 3 秒）
    this._pollTimer = setInterval(() => this._loadMessages(), 3000)
  },

  onUnload() {
    if (this._pollTimer) clearInterval(this._pollTimer)
  },

  async _loadBottle() {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('drift_bottles').doc(this.data.bottleId).get()
      this.setData({ bottle: data || {} })
    } catch (e) {
      console.error('load bottle fail', e)
    }
  },

  async _loadMessages() {
    try {
      const msgs = await api.getDriftMessages(this.data.bottleId)
      const formatted = msgs.map(m => ({
        ...m,
        _timeStr: formatTime(m.createdAt)
      }))
      this.setData({
        messages: formatted,
        loading: false,
        scrollTo: 'msg-bottom'
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  async onSend() {
    const text = this.data.inputText.trim()
    if (!text) return
    if (sensitive.hasSensitive(text)) {
      wx.showToast({ title: '内容含违规词，请修改', icon: 'none' })
      return
    }

    this.setData({ inputText: '' })
    try {
      await api.sendDriftMessage({
        bottleId: this.data.bottleId,
        senderId: this.data.currentUserId,
        content: text
      })
      await this._loadMessages()
    } catch (e) {
      wx.showToast({ title: e.message || '发送失败', icon: 'none' })
    }
  },

  onReport() {
    wx.showActionSheet({
      itemList: ['恶意内容', '广告骚扰', '违法违规', '其他'],
      success: async (res) => {
        const reasons = ['恶意内容', '广告骚扰', '违法违规', '其他']
        try {
          const result = await api.reportBottle({
            bottleId: this.data.bottleId,
            reporterId: this.data.currentUserId,
            reason: reasons[res.tapIndex]
          })
          wx.showToast({ title: '举报成功，我们会尽快处理', icon: 'success' })
          if (result.blocked) {
            setTimeout(() => wx.navigateBack(), 1500)
          }
        } catch (e) {
          wx.showToast({ title: '举报失败', icon: 'none' })
        }
      }
    })
  },

  onEnd() {
    wx.showModal({
      title: '结束对话',
      content: '确定要将这个漂流瓶送回大海吗？',
      confirmText: '回海',
      confirmColor: '#07C160',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.endBottle(this.data.bottleId)
          wx.showToast({ title: '漂流瓶已回海 🌊', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 1500)
        } catch (e) {
          wx.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    })
  }
})
