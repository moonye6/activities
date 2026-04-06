// pages/drift/throw.js
const api = require('../../utils/api')
const sensitive = require('../../utils/sensitive')

const ALL_TAGS = ['运动健身', '户外徒步', '桌游', '读书', '摄影', '美食', '音乐', '骑行', '旅游', '电影']

Page({
  data: {
    content: '',
    selectedTags: [],
    allTags: ALL_TAGS,
    submitting: false,
    sensitiveWarning: false
  },

  onContentInput(e) {
    const content = e.detail.value
    this.setData({
      content,
      sensitiveWarning: sensitive.hasSensitive(content)
    })
  },

  onToggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    const tags = [...this.data.selectedTags]
    const idx = tags.indexOf(tag)
    if (idx >= 0) {
      tags.splice(idx, 1)
    } else if (tags.length < 3) {
      tags.push(tag)
    } else {
      wx.showToast({ title: '最多选3个标签', icon: 'none' })
      return
    }
    this.setData({ selectedTags: tags })
  },

  async onSubmit() {
    const { content, selectedTags, sensitiveWarning } = this.data
    if (!content.trim()) {
      wx.showToast({ title: '请先写点什么', icon: 'none' })
      return
    }
    if (sensitiveWarning) {
      wx.showToast({ title: '内容包含违规词，请修改', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      const user = await api.getCurrentUser()
      await api.throwBottle({
        userId: user._id,
        content: content.trim(),
        tags: selectedTags
      })
      wx.showToast({ title: '漂流瓶已丢出 🌊', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: e.message || '丢瓶失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
