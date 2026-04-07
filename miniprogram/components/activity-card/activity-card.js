// components/activity-card/activity-card.js
const util = require('../../utils/util')
const api = require('../../utils/api')

Component({
  properties: {
    activity: {
      type: Object,
      value: {}
    },
    currentUserId: {
      type: String,
      value: ''
    }
  },

  computed: {
    // 注意：小程序原生不支持 computed，改用 observers 实现
  },

  data: {
    typeInfo: {},
    statusInfo: {},
    timeLabel: '',
    rsvpCounts: { yes: 0, maybe: 0, no: 0 },
    progressPct: 0,
    myRsvp: null,
    myRsvpInfo: {},
    displayTags: []
  },

  observers: {
    'activity, currentUserId': function(activity, currentUserId) {
      if (!activity || !activity._id) return
      this._updateDisplay(activity, currentUserId)
    }
  },

  methods: {
    _updateDisplay(activity, currentUserId) {
      const typeInfo = util.mapActivityType(activity.type)
      const statusInfo = util.mapActivityStatus(activity.status)
      const timeLabel = util.formatTime(activity.time)
      const rsvpCounts = util.countRsvps(activity.rsvps)
      const progressPct = activity.maxCount > 0
        ? Math.min(100, Math.round((rsvpCounts.yes / activity.maxCount) * 100))
        : 0
      const myRsvp = (activity.rsvps || []).find(r => r.userId === currentUserId)
      const myRsvpInfo = myRsvp ? util.mapRsvpStatus(myRsvp.status) : null

      // 处理标签展示
      const tags = Array.isArray(activity.tags) ? activity.tags : []
      const { systemTags } = api.getEnums()
      const displayTags = tags.map(tag => {
        if (tag && typeof tag === 'object' && tag.key) {
          const def = systemTags.find(t => t.key === tag.key)
          return {
            key: tag.key,
            label: def ? def.label : tag.key,
            isIdentity: def ? def.category === 'identity' : false
          }
        }
        // 兼容旧格式字符串
        if (typeof tag === 'string') return { key: tag, label: tag, isIdentity: false }
        return null
      }).filter(Boolean).slice(0, 3)  // 卡片最多展示3个标签

      this.setData({
        typeInfo,
        statusInfo,
        timeLabel,
        rsvpCounts,
        progressPct,
        myRsvp,
        myRsvpInfo,
        displayTags
      })
    },

    onTap() {
      this.triggerEvent('tap', { activity: this.data.activity })
    }
  }
})
