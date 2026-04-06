// components/activity-card/activity-card.js
const util = require('../../utils/util')

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
    myRsvpInfo: {}
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

      this.setData({
        typeInfo,
        statusInfo,
        timeLabel,
        rsvpCounts,
        progressPct,
        myRsvp,
        myRsvpInfo
      })
    },

    onTap() {
      this.triggerEvent('tap', { activity: this.data.activity })
    }
  }
})
