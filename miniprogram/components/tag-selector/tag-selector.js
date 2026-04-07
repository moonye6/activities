// components/tag-selector/tag-selector.js
Component({
  properties: {
    title: { type: String, value: '' },
    // 系统标签（结构化对象数组）
    systemTags: { type: Array, value: [] },
    customTags: { type: Array, value: [] },
    // 已选中的标签 key 数组
    selected: { type: Array, value: [] },
    showCustom: { type: Boolean, value: true },
    max: { type: Number, value: 5 },
    // 当前用户信息（用于身份标签显示属性值）
    userInfo: { type: Object, value: {} }
  },

  data: {
    showInput: false,
    inputVal: '',
    identityTags: [],
    interestTags: []
  },

  observers: {
    'systemTags, userInfo': function(systemTags, userInfo) {
      if (!Array.isArray(systemTags)) return
      const identityTags = systemTags
        .filter(t => t.category === 'identity')
        .map(t => {
          let hint = ''
          if (userInfo && t.matchField) {
            if (t.matchMode === 'exact') {
              // 如：同事 - 腾讯
              const val = userInfo[t.matchField]
              hint = val ? ` · ${val}` : ' · 未设置'
            } else if (t.matchMode === 'value') {
              // 如：女生（固定值，无需显示用户值）
              hint = ''
            }
          }
          return { ...t, hint }
        })
      const interestTags = systemTags.filter(t => t.category === 'interest')
      this.setData({ identityTags, interestTags })
    }
  },

  methods: {
    onToggle(e) {
      const key = e.currentTarget.dataset.key
      const tagDef = e.currentTarget.dataset.tag
      const selected = [...this.data.selected]
      const idx = selected.indexOf(key)

      // 身份标签检查：exact 类型需要用户已填属性
      if (idx < 0 && tagDef && tagDef.category === 'identity' && tagDef.matchMode === 'exact') {
        const userInfo = this.data.userInfo || {}
        const val = userInfo[tagDef.matchField]
        if (!val) {
          wx.showToast({
            title: `请先在个人中心设置${tagDef.matchField === 'company' ? '公司' : '学校'}`,
            icon: 'none'
          })
          return
        }
      }

      if (idx >= 0) {
        selected.splice(idx, 1)
      } else {
        if (selected.length >= this.data.max) {
          wx.showToast({ title: `最多选${this.data.max}个标签`, icon: 'none' })
          return
        }
        selected.push(key)
      }
      this.triggerEvent('change', { selected })
    },

    showAddInput() {
      this.setData({ showInput: true, inputVal: '' })
    },

    onInput(e) {
      this.setData({ inputVal: e.detail.value })
    },

    onAddConfirm() {
      const val = this.data.inputVal.trim()
      if (!val) {
        this.setData({ showInput: false })
        return
      }
      // 自定义标签用 custom_ 前缀作为 key
      const key = 'custom_' + val
      const customTags = [...this.data.customTags]
      const selected = [...this.data.selected]
      if (!customTags.includes(val)) {
        customTags.push(val)
      }
      if (!selected.includes(key)) {
        if (selected.length < this.data.max) {
          selected.push(key)
        }
      }
      this.setData({ showInput: false, inputVal: '' })
      this.triggerEvent('customChange', { customTags })
      this.triggerEvent('change', { selected })
    }
  }
})
