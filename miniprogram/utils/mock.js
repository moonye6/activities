// utils/mock.js — MVP 阶段完整 mock 数据

const USERS = [
  {
    _id: 'user_001',
    nickName: '活动达人',
    avatarUrl: '',
    tags: ['同事', '吃货', '运动爱好者'],
    createdAt: 1740000000000
  },
  {
    _id: 'user_002',
    nickName: '小明',
    avatarUrl: '',
    tags: ['同事', '篮球'],
    createdAt: 1740100000000
  },
  {
    _id: 'user_003',
    nickName: '阿花',
    avatarUrl: '',
    tags: ['同学', '吃货', '电影迷'],
    createdAt: 1740200000000
  },
  {
    _id: 'user_004',
    nickName: '大壮',
    avatarUrl: '',
    tags: ['同事', '运动爱好者'],
    createdAt: 1740300000000
  },
  {
    _id: 'user_005',
    nickName: '晓晓',
    avatarUrl: '',
    tags: ['同学', '聚会'],
    createdAt: 1740400000000
  }
]

const ACTIVITIES = [
  {
    _id: 'act_001',
    title: '周五一起吃火锅🔥',
    type: 'dinner',
    time: '2026-04-10 19:00',
    location: '三里屯海底捞',
    visibility: 'friends',
    tags: ['同事', '吃货'],
    maxCount: 6,
    creatorId: 'user_001',
    status: 'recruiting',
    rsvps: [
      { userId: 'user_001', status: 'yes' },
      { userId: 'user_002', status: 'yes' },
      { userId: 'user_003', status: 'maybe' }
    ],
    createdAt: 1744000000000
  },
  {
    _id: 'act_002',
    title: '周末羽毛球约起来🏸',
    type: 'sport',
    time: '2026-04-12 09:00',
    location: '朝阳公园体育馆',
    visibility: 'public',
    tags: ['运动爱好者'],
    maxCount: 4,
    creatorId: 'user_002',
    status: 'confirmed',
    rsvps: [
      { userId: 'user_001', status: 'yes' },
      { userId: 'user_002', status: 'yes' },
      { userId: 'user_004', status: 'yes' },
      { userId: 'user_005', status: 'yes' }
    ],
    createdAt: 1743900000000
  },
  {
    _id: 'act_003',
    title: '看《奥本海默》重映',
    type: 'movie',
    time: '2026-04-08 20:00',
    location: '望京万达影城',
    visibility: 'friends',
    tags: ['同学', '电影迷'],
    maxCount: 5,
    creatorId: 'user_003',
    status: 'recruiting',
    rsvps: [
      { userId: 'user_001', status: 'maybe' },
      { userId: 'user_003', status: 'yes' }
    ],
    createdAt: 1743800000000
  },
  {
    _id: 'act_004',
    title: '五一聚会🎉',
    type: 'party',
    time: '2026-05-01 18:00',
    location: '待定',
    visibility: 'public',
    tags: ['同学', '聚会'],
    maxCount: 20,
    creatorId: 'user_001',
    status: 'recruiting',
    rsvps: [
      { userId: 'user_001', status: 'yes' },
      { userId: 'user_003', status: 'yes' },
      { userId: 'user_005', status: 'yes' }
    ],
    createdAt: 1743700000000
  },
  {
    _id: 'act_005',
    title: '摄影入门课（免费）',
    type: 'course',
    time: '2026-04-15 14:00',
    location: '三里屯 4SPACE',
    visibility: 'public',
    tags: ['摄影', '学习'],
    maxCount: 15,
    creatorId: 'user_004',
    status: 'recruiting',
    rsvps: [
      { userId: 'user_001', status: 'no' },
      { userId: 'user_004', status: 'yes' }
    ],
    createdAt: 1743600000000
  },
  {
    _id: 'act_006',
    title: '上周五的烧烤局',
    type: 'dinner',
    time: '2026-04-01 18:30',
    location: '798艺术区',
    visibility: 'friends',
    tags: ['同事'],
    maxCount: 8,
    creatorId: 'user_001',
    status: 'ended',
    rsvps: [
      { userId: 'user_001', status: 'yes' },
      { userId: 'user_002', status: 'yes' },
      { userId: 'user_004', status: 'yes' }
    ],
    createdAt: 1743200000000
  }
]

// 系统预设标签
const SYSTEM_TAGS = [
  '同事', '同学', '朋友', '家人',
  '吃货', '运动爱好者', '电影迷', '摄影', '游戏', '音乐',
  '学习', '聚会', '旅游', '读书会'
]

// 活动类型枚举
const ACTIVITY_TYPES = [
  { value: 'dinner', label: '吃饭', emoji: '🍜', color: '#FF6B35' },
  { value: 'sport', label: '运动', emoji: '🏃', color: '#34C759' },
  { value: 'party', label: '聚会', emoji: '🎉', color: '#FF9500' },
  { value: 'movie', label: '电影', emoji: '🎬', color: '#007AFF' },
  { value: 'course', label: '课程', emoji: '📚', color: '#AF52DE' },
  { value: 'other', label: '其他', emoji: '✨', color: '#AAAAAA' }
]

// 可见范围枚举
const VISIBILITY_OPTIONS = [
  { value: 'friends', label: '朋友可见', desc: '仅互相关注的好友可见' },
  { value: 'public', label: '公开', desc: '所有人可见' },
  { value: 'tags', label: '指定标签', desc: '仅指定标签成员可见' }
]

module.exports = {
  USERS,
  ACTIVITIES,
  SYSTEM_TAGS,
  ACTIVITY_TYPES,
  VISIBILITY_OPTIONS
}
