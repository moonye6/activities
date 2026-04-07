// utils/mock.js — MVP 阶段完整 mock 数据

const USERS = [
  {
    _id: 'user_001',
    nickName: '活动达人',
    avatarUrl: '',
    gender: 'female',
    company: '腾讯',
    school: '北京大学',
    tags: ['colleague', 'foodie', 'sports'],
    createdAt: 1740000000000
  },
  {
    _id: 'user_002',
    nickName: '小明',
    avatarUrl: '',
    gender: 'male',
    company: '腾讯',
    school: '清华大学',
    tags: ['colleague', 'sports'],
    createdAt: 1740100000000
  },
  {
    _id: 'user_003',
    nickName: '阿花',
    avatarUrl: '',
    gender: 'female',
    company: '字节跳动',
    school: '北京大学',
    tags: ['schoolmate', 'foodie', 'movie'],
    createdAt: 1740200000000
  },
  {
    _id: 'user_004',
    nickName: '大壮',
    avatarUrl: '',
    gender: 'male',
    company: '腾讯',
    school: '浙江大学',
    tags: ['colleague', 'sports'],
    createdAt: 1740300000000
  },
  {
    _id: 'user_005',
    nickName: '晓晓',
    avatarUrl: '',
    gender: 'female',
    company: '美团',
    school: '北京大学',
    tags: ['schoolmate', 'party'],
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
    visibility: 'tags',
    tags: [
      { key: 'colleague', matchField: 'company', matchValue: '腾讯' },
      { key: 'foodie', matchField: null, matchValue: null }
    ],
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
    tags: [
      { key: 'sports', matchField: null, matchValue: null }
    ],
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
    visibility: 'tags',
    tags: [
      { key: 'schoolmate', matchField: 'school', matchValue: '北京大学' },
      { key: 'movie', matchField: null, matchValue: null }
    ],
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
    tags: [
      { key: 'schoolmate', matchField: 'school', matchValue: '北京大学' },
      { key: 'party', matchField: null, matchValue: null }
    ],
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
    tags: [
      { key: 'photography', matchField: null, matchValue: null },
      { key: 'study', matchField: null, matchValue: null }
    ],
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
    visibility: 'tags',
    tags: [
      { key: 'colleague', matchField: 'company', matchValue: '腾讯' }
    ],
    maxCount: 8,
    creatorId: 'user_001',
    status: 'ended',
    rsvps: [
      { userId: 'user_001', status: 'yes' },
      { userId: 'user_002', status: 'yes' },
      { userId: 'user_004', status: 'yes' }
    ],
    createdAt: 1743200000000
  },
  {
    _id: 'act_007',
    title: '女生下午茶🍰',
    type: 'dinner',
    time: '2026-04-13 15:00',
    location: '国贸商城 Lady M',
    visibility: 'tags',
    tags: [
      { key: 'female', matchField: 'gender', matchValue: 'female' },
      { key: 'foodie', matchField: null, matchValue: null }
    ],
    maxCount: 8,
    creatorId: 'user_001',
    status: 'recruiting',
    rsvps: [
      { userId: 'user_001', status: 'yes' },
      { userId: 'user_005', status: 'yes' }
    ],
    createdAt: 1743500000000
  }
]

// ========================================
// 系统标签定义（结构化）
// ========================================
// category: 'identity' = 身份标签（绑定属性，用于可见性过滤）
// category: 'interest' = 兴趣标签（仅分类/推荐用）
// matchField: 身份标签匹配的用户属性字段名
// matchMode: 'exact' = 精确匹配同值可见; 'value' = 匹配标签自带的固定值
const SYSTEM_TAGS = [
  // ── 身份标签 ──
  { key: 'female',     label: '女生',       category: 'identity', matchField: 'gender',  matchMode: 'value', matchValue: 'female', icon: '🔒' },
  { key: 'male',       label: '男生',       category: 'identity', matchField: 'gender',  matchMode: 'value', matchValue: 'male',   icon: '🔒' },
  { key: 'colleague',  label: '同事',       category: 'identity', matchField: 'company', matchMode: 'exact', matchValue: null,      icon: '🔒' },
  { key: 'schoolmate', label: '同学',       category: 'identity', matchField: 'school',  matchMode: 'exact', matchValue: null,      icon: '🔒' },

  // ── 兴趣标签 ──
  { key: 'foodie',      label: '吃货',       category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'sports',      label: '运动爱好者', category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'movie',       label: '电影迷',     category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'photography', label: '摄影',       category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'gaming',      label: '游戏',       category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'music',       label: '音乐',       category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'study',       label: '学习',       category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'party',       label: '聚会',       category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'travel',      label: '旅游',       category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null },
  { key: 'reading',     label: '读书会',     category: 'interest', matchField: null, matchMode: null, matchValue: null, icon: null }
]

// 性别选项枚举
const GENDER_OPTIONS = [
  { value: 'male',   label: '男' },
  { value: 'female', label: '女' },
  { value: 'other',  label: '其他' }
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
  { value: 'friends', label: '朋友可见', desc: '仅互相关注的好友可见', icon: '👥' },
  { value: 'public', label: '公开', desc: '所有人可见', icon: '🌐' },
  { value: 'tags', label: '指定标签', desc: '仅指定标签成员可见', icon: '🏷️' }
]

module.exports = {
  USERS,
  ACTIVITIES,
  SYSTEM_TAGS,
  ACTIVITY_TYPES,
  VISIBILITY_OPTIONS,
  GENDER_OPTIONS
}
