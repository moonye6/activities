// components/tag-selector/tag-selector.js
Component({
  properties: {
    title: { type: String, value: '' },
    systemTags: { type: Array, value: [] },
    customTags: { type: Array, value: [] },
    selected: { type: Array, value: [] },
    showCustom: { type: Boolean, value: true },
    max: { type: Number, value: 5 }
  },

  data: {
    showInput: false,
    inputVal: ''
  },

  methods: {
    onToggle(e) {
      const tag = e.currentTarget.dataset.tag
      const selected = [...this.data.selected]
      const idx = selected.indexOf(tag)
      if (idx >= 0) {
        selected.splice(idx, 1)
      } else {
        if (selected.length >= this.data.max) {
          wx.showToast({ title: `最多选${this.data.max}个标签`, icon: 'none' })
          return
        }
        selected.push(tag)
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
      const customTags = [...this.data.customTags]
      const selected = [...this.data.selected]
      if (!customTags.includes(val)) {
        customTags.push(val)
      }
      if (!selected.includes(val)) {
        if (selected.length < this.data.max) {
          selected.push(val)
        }
      }
      this.setData({ showInput: false, inputVal: '' })
      this.triggerEvent('customChange', { customTags })
      this.triggerEvent('change', { selected })
    }
  }
})
