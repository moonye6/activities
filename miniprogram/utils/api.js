// utils/api.js — 数据抽象层
// MVP 阶段调用 mock.js，切换云开发只需修改此文件

const mock = require('./mock')

// ===================================================
// 切换开关：false = mock数据，true = 微信云开发
// 开通云开发后将此值改为 true
// ===================================================
const USE_CLOUD = false

// 模拟网络延迟（mock 模式）
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成唯一 ID（mock 模式使用）
let _idCounter = 100
const genId = (prefix) => `${prefix}_${Date.now()}_${++_idCounter}`

// ===================================================
// 内存存储（mock 模式，运行时可读写）
// ===================================================
let _activities = [...mock.ACTIVITIES]
let _users = [...mock.USERS]

// ===================================================
// 用户相关
// ===================================================

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} userInfo
 */
async function getCurrentUser() {
  if (USE_CLOUD) {
    // 云开发版本（待接入）
    // const { result } = await wx.cloud.callFunction({ name: 'activityService', data: { action: 'getCurrentUser' } })
    // return result.data
  }
  await delay(100)
  const app = getApp()
  return app.globalData.userInfo
}

/**
 * 根据 ID 获取用户
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function getUserById(userId) {
  if (USE_CLOUD) {
    // const db = wx.cloud.database()
    // return await db.collection('users').doc(userId).get().then(r => r.data)
  }
  await delay(50)
  return _users.find(u => u._id === userId) || null
}

/**
 * 批量获取用户
 * @param {string[]} userIds
 * @returns {Promise<Object[]>}
 */
async function getUsersByIds(userIds) {
  if (USE_CLOUD) {
    // const db = wx.cloud.database()
    // const { data } = await db.collection('users').where({ _id: db.command.in(userIds) }).get()
    // return data
  }
  await delay(100)
  return _users.filter(u => userIds.includes(u._id))
}

// ===================================================
// 活动相关
// ===================================================

/**
 * 获取活动列表
 * @param {Object} options - { tab: 'all'|'mine'|'joined', currentUserId }
 * @returns {Promise<Object[]>}
 */
async function getActivities({ tab = 'all', currentUserId } = {}) {
  if (USE_CLOUD) {
    // const db = wx.cloud.database()
    // const { data } = await db.collection('activities').orderBy('createdAt', 'desc').get()
    // return data
  }
  await delay(300)
  let list = [..._activities].sort((a, b) => b.createdAt - a.createdAt)
  if (tab === 'mine') {
    list = list.filter(a => a.creatorId === currentUserId)
  } else if (tab === 'joined') {
    list = list.filter(a =>
      a.creatorId !== currentUserId &&
      a.rsvps.some(r => r.userId === currentUserId && r.status === 'yes')
    )
  }
  return list
}

/**
 * 根据 ID 获取活动详情
 * @param {string} actId
 * @returns {Promise<Object>}
 */
async function getActivityById(actId) {
  if (USE_CLOUD) {
    // const db = wx.cloud.database()
    // return await db.collection('activities').doc(actId).get().then(r => r.data)
  }
  await delay(200)
  return _activities.find(a => a._id === actId) || null
}

/**
 * 创建活动
 * @param {Object} data - 活动数据（不含 _id/createdAt/status/rsvps）
 * @returns {Promise<Object>} 创建的活动
 */
async function createActivity(data) {
  if (USE_CLOUD) {
    // const db = wx.cloud.database()
    // const { _id } = await db.collection('activities').add({ data: { ...data, status: 'recruiting', rsvps: [], createdAt: Date.now() } })
    // return await getActivityById(_id)
  }
  await delay(400)
  const newActivity = {
    _id: genId('act'),
    ...data,
    status: 'recruiting',
    rsvps: [{ userId: data.creatorId, status: 'yes' }],
    createdAt: Date.now()
  }
  _activities.unshift(newActivity)
  return newActivity
}

/**
 * 更新活动 RSVP 状态
 * @param {string} actId
 * @param {string} userId
 * @param {'yes'|'maybe'|'no'} rsvpStatus
 * @returns {Promise<Object>} 更新后的活动
 */
async function updateRsvp(actId, userId, rsvpStatus) {
  if (USE_CLOUD) {
    // const { result } = await wx.cloud.callFunction({
    //   name: 'activityService',
    //   data: { action: 'updateRsvp', actId, userId, rsvpStatus }
    // })
    // return result.data
  }
  await delay(300)
  const act = _activities.find(a => a._id === actId)
  if (!act) throw new Error('活动不存在')
  const existIdx = act.rsvps.findIndex(r => r.userId === userId)
  if (existIdx >= 0) {
    act.rsvps[existIdx].status = rsvpStatus
  } else {
    act.rsvps.push({ userId, status: rsvpStatus })
  }
  return { ...act }
}

/**
 * 获取用户的活动统计
 * @param {string} userId
 * @returns {Promise<Object>} { created, joined, ended }
 */
async function getUserStats(userId) {
  await delay(150)
  const created = _activities.filter(a => a.creatorId === userId).length
  const joined = _activities.filter(a =>
    a.creatorId !== userId &&
    a.rsvps.some(r => r.userId === userId && r.status === 'yes')
  ).length
  const ended = _activities.filter(a =>
    (a.creatorId === userId || a.rsvps.some(r => r.userId === userId && r.status === 'yes')) &&
    a.status === 'ended'
  ).length
  return { created, joined, ended }
}

/**
 * 获取枚举数据
 */
function getEnums() {
  return {
    activityTypes: mock.ACTIVITY_TYPES,
    visibilityOptions: mock.VISIBILITY_OPTIONS,
    systemTags: mock.SYSTEM_TAGS
  }
}

module.exports = {
  getCurrentUser,
  getUserById,
  getUsersByIds,
  getActivities,
  getActivityById,
  createActivity,
  updateRsvp,
  getUserStats,
  getEnums
}
