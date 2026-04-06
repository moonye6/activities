// utils/api.js — 数据抽象层（云开发版）
// 活动数据存储在云数据库 juwu 集合中
// 用户数据存储在 juwu_users 集合中

const mock = require('./mock')

// 获取数据库引用
function db() {
  return wx.cloud.database()
}

// juwu 活动集合
function col() {
  return db().collection('juwu')
}

// juwu_users 用户集合
function userCol() {
  return db().collection('juwu_users')
}

// ===================================================
// 用户相关
// ===================================================

/**
 * 从数据库重新获取当前用户最新信息并更新 globalData
 */
async function refreshCurrentUser() {
  const { data } = await userCol().limit(1).get()
  console.log('[refreshCurrentUser] data:', JSON.stringify(data))
  if (data.length > 0) {
    const app = getApp()
    app.globalData.userInfo = data[0]
    return data[0]
  }
  return getApp().globalData.userInfo
}

/**
 * 获取当前用户信息（等待 app.js 初始化完成）
 */
async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const app = getApp()
    if (app.globalData.userInfo) {
      resolve(app.globalData.userInfo)
      return
    }
    let waited = 0
    const timer = setInterval(() => {
      if (app.globalData.userInfo) {
        clearInterval(timer)
        resolve(app.globalData.userInfo)
      } else if (waited >= 8000) {
        clearInterval(timer)
        reject(new Error('获取用户信息超时，请检查网络或云开发环境配置'))
      }
      waited += 100
    }, 100)
  })
}

/**
 * 根据 ID 获取用户
 * juwu_users 权限为"仅创建者可读写"时只能读自己，
 * 读他人会报权限错误，降级返回占位对象。
 */
async function getUserById(userId) {
  try {
    const { data } = await userCol().doc(userId).get()
    return data || null
  } catch (e) {
    // 无权限读取他人记录，返回占位
    return { _id: userId, nickName: '用户' + userId.slice(-4) }
  }
}

/**
 * 批量获取用户（权限不足时逐条降级）
 */
async function getUsersByIds(userIds) {
  if (!userIds || userIds.length === 0) return []
  // 先尝试批量查询（需要集合权限为"所有用户可读"）
  try {
    const { data } = await userCol()
      .where({ _id: db().command.in(userIds) })
      .get()
    // 补全查询不到的用户（权限或不存在）
    const found = new Set(data.map(u => u._id))
    const fallback = userIds
      .filter(id => !found.has(id))
      .map(id => ({ _id: id, nickName: '用户' + id.slice(-4) }))
    return [...data, ...fallback]
  } catch (e) {
    // 批量查询失败，逐条降级
    return userIds.map(id => ({ _id: id, nickName: '用户' + id.slice(-4) }))
  }
}

// ===================================================
// 活动相关（juwu 集合）
// ===================================================

/**
 * 获取活动列表
 * juwu 集合权限需设为"所有用户可读，仅创建者可写"
 */
async function getActivities({ tab = 'all', currentUserId } = {}) {
  let query

  if (tab === 'mine') {
    query = col()
      .where({ creatorId: currentUserId })
      .orderBy('createdAt', 'desc')
      .limit(50)
  } else {
    query = col()
      .orderBy('createdAt', 'desc')
      .limit(50)
  }

  const { data } = await query.get()

  if (tab === 'joined') {
    return data.filter(a =>
      a.creatorId !== currentUserId &&
      Array.isArray(a.rsvps) &&
      a.rsvps.some(r => r.userId === currentUserId && r.status === 'yes')
    )
  }

  return data
}

/**
 * 根据 ID 获取活动详情
 */
async function getActivityById(actId) {
  try {
    const { data } = await col().doc(actId).get()
    return data || null
  } catch (e) {
    console.error('getActivityById fail', e)
    return null
  }
}

/**
 * 创建活动
 */
async function createActivity(data) {
  const newData = {
    ...data,
    status: 'recruiting',
    rsvps: [{ userId: data.creatorId, status: 'yes' }],
    createdAt: Date.now()
  }
  const { _id } = await col().add({ data: newData })
  return { _id, ...newData }
}

/**
 * 更新 RSVP 状态
 * 注意：云数据库 update 需要记录的 _openid 与当前用户匹配，
 * 或集合权限设为"所有用户可读写"。
 * 推荐将 juwu 集合权限设为"所有用户可读，所有用户可写"用于开发阶段。
 */
async function updateRsvp(actId, userId, rsvpStatus) {
  const act = await getActivityById(actId)
  if (!act) throw new Error('活动不存在')

  const rsvps = Array.isArray(act.rsvps) ? [...act.rsvps] : []
  const idx = rsvps.findIndex(r => r.userId === userId)
  if (idx >= 0) {
    rsvps[idx] = { userId, status: rsvpStatus }
  } else {
    rsvps.push({ userId, status: rsvpStatus })
  }

  await col().doc(actId).update({ data: { rsvps } })
  return { ...act, rsvps }
}

/**
 * 获取用户活动统计
 */
async function getUserStats(userId) {
  const _ = db().command
  const [createdRes, allJoinedRes, endedCreatedRes, endedJoinedRes] = await Promise.all([
    // 我发起的
    col().where({ creatorId: userId }).count(),
    // 所有活动（用于筛选我参与的，云数据库不支持数组内嵌对象查询，取前100条客户端过滤）
    col().orderBy('createdAt', 'desc').limit(100).get(),
    // 我发起且已结束
    col().where({ creatorId: userId, status: 'ended' }).count(),
    // 所有已结束活动（筛选我参与的）
    col().where({ status: 'ended' }).limit(100).get()
  ])

  const created = createdRes.total

  const joined = allJoinedRes.data.filter(a =>
    a.creatorId !== userId &&
    Array.isArray(a.rsvps) &&
    a.rsvps.some(r => r.userId === userId && r.status === 'yes')
  ).length

  const endedAsCreator = endedCreatedRes.total
  const endedAsJoined = endedJoinedRes.data.filter(a =>
    a.creatorId !== userId &&
    Array.isArray(a.rsvps) &&
    a.rsvps.some(r => r.userId === userId && r.status === 'yes')
  ).length
  const ended = endedAsCreator + endedAsJoined

  return { created, joined, ended }
}

/**
 * 更新用户信息（昵称、头像等）
 * @param {string} userId
 * @param {Object} fields - 要更新的字段
 */
async function updateUserInfo(userId, fields) {
  return await userCol().doc(userId).update({ data: fields })
}

/**
 * 获取枚举数据（本地静态，无需云端）
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
  refreshCurrentUser,
  getUserById,
  getUsersByIds,
  getActivities,
  getActivityById,
  createActivity,
  updateRsvp,
  getUserStats,
  updateUserInfo,
  getEnums
}
