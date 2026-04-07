// utils/util.js — 工具函数

/**
 * 格式化时间为友好文案
 * @param {string} timeStr - '2026-04-10 19:00' 格式
 * @returns {string} 友好时间文案
 */
function formatTime(timeStr) {
  if (!timeStr) return ''
  const target = new Date(timeStr.replace(' ', 'T'))
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diff = Math.round((targetDay - today) / (1000 * 60 * 60 * 24))

  const hm = timeStr.split(' ')[1] || ''

  if (diff === 0) return `今天 ${hm}`
  if (diff === 1) return `明天 ${hm}`
  if (diff === 2) return `后天 ${hm}`
  if (diff === -1) return `昨天 ${hm}`
  if (diff > 2 && diff <= 7) return `${diff}天后 ${hm}`

  // 超出一周，格式化为 M月D日
  const m = target.getMonth() + 1
  const d = target.getDate()
  return `${m}月${d}日 ${hm}`
}

/**
 * 时间戳格式化
 * @param {number} timestamp
 * @param {string} format 'date' | 'datetime' | 'relative'
 */
function formatTimestamp(timestamp, format = 'date') {
  const d = new Date(timestamp)
  const pad = n => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const h = pad(d.getHours())
  const min = pad(d.getMinutes())

  if (format === 'datetime') return `${y}-${m}-${day} ${h}:${min}`
  if (format === 'date') return `${y}-${m}-${day}`

  // relative
  const now = Date.now()
  const sec = Math.floor((now - timestamp) / 1000)
  if (sec < 60) return '刚刚'
  if (sec < 3600) return `${Math.floor(sec / 60)}分钟前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}小时前`
  const days = Math.floor(sec / 86400)
  if (days <= 7) return `${days}天前`
  return `${m}-${day}`
}

/**
 * 活动状态映射
 * @param {string} status
 * @returns {{ label: string, tagClass: string }}
 */
function mapActivityStatus(status) {
  const map = {
    recruiting: { label: '招募中', tagClass: 'tag-warning' },
    confirmed:  { label: '已确认', tagClass: 'tag-success' },
    ended:      { label: '已结束', tagClass: 'tag-gray' },
    cancelled:  { label: '已取消', tagClass: 'tag-danger' }
  }
  return map[status] || { label: '未知', tagClass: 'tag-gray' }
}

/**
 * RSVP 状态映射
 * @param {string} status
 * @returns {{ label: string, color: string }}
 */
function mapRsvpStatus(status) {
  const map = {
    yes:   { label: '参加', color: '#34C759', icon: '✓' },
    maybe: { label: '暂定', color: '#FF9500', icon: '?' },
    no:    { label: '拒绝', color: '#FF3B30', icon: '✕' }
  }
  return map[status] || { label: '未回复', color: '#AAAAAA', icon: '-' }
}

/**
 * 活动类型映射
 * @param {string} type
 * @returns {{ label: string, emoji: string, color: string }}
 */
function mapActivityType(type) {
  const map = {
    dinner: { label: '吃饭', emoji: '🍜', color: '#FF6B35' },
    sport:  { label: '运动', emoji: '🏃', color: '#34C759' },
    party:  { label: '聚会', emoji: '🎉', color: '#FF9500' },
    movie:  { label: '电影', emoji: '🎬', color: '#007AFF' },
    course: { label: '课程', emoji: '📚', color: '#AF52DE' },
    other:  { label: '其他', emoji: '✨', color: '#AAAAAA' }
  }
  return map[type] || map.other
}

/**
 * 可见范围映射
 * @param {string} visibility
 * @returns {string}
 */
function mapVisibility(visibility) {
  const map = {
    friends: '朋友可见',
    public:  '公开',
    tags:    '标签可见（限定范围）'
  }
  return map[visibility] || '未知'
}

/**
 * 统计 RSVP 数量
 * @param {Object[]} rsvps
 * @returns {{ yes: number, maybe: number, no: number, total: number }}
 */
function countRsvps(rsvps = []) {
  const yes = rsvps.filter(r => r.status === 'yes').length
  const maybe = rsvps.filter(r => r.status === 'maybe').length
  const no = rsvps.filter(r => r.status === 'no').length
  return { yes, maybe, no, total: rsvps.length }
}

/**
 * 生成头像占位字（取昵称首字）
 * @param {string} nickName
 * @returns {string}
 */
function avatarPlaceholder(nickName = '') {
  return nickName.charAt(0) || '?'
}

/**
 * 生成头像背景色（基于用户ID哈希）
 * @param {string} userId
 * @returns {string}
 */
function avatarColor(userId = '') {
  const colors = ['#FF6B35', '#34C759', '#007AFF', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA']
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

module.exports = {
  formatTime,
  formatTimestamp,
  mapActivityStatus,
  mapRsvpStatus,
  mapActivityType,
  mapVisibility,
  countRsvps,
  avatarPlaceholder,
  avatarColor
}
