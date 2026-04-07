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
 * 新增：基于标签的可见性过滤
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

  let filtered = data

  if (tab === 'joined') {
    filtered = data.filter(a =>
      a.creatorId !== currentUserId &&
      Array.isArray(a.rsvps) &&
      a.rsvps.some(r => r.userId === currentUserId && r.status === 'yes')
    )
  }

  // ── 标签可见性过滤 ──
  if (currentUserId && tab !== 'mine') {
    // 获取当前用户信息（用于属性匹配）
    let currentUser = null
    try {
      currentUser = getApp().globalData.userInfo
      if (!currentUser || currentUser._id !== currentUserId) {
        const { data: userData } = await userCol().doc(currentUserId).get()
        currentUser = userData
      }
    } catch (_) {}

    filtered = filtered.filter(act => {
      // 发布者自己始终可见
      if (act.creatorId === currentUserId) return true
      // public / friends 保持原逻辑
      if (act.visibility !== 'tags') return true
      // visibility === 'tags' 时进行标签过滤
      const tags = Array.isArray(act.tags) ? act.tags : []
      // 取出身份标签（有 matchField 的）
      const identityTags = tags.filter(t => t && t.matchField)
      // 如果没有身份标签，仅含兴趣标签，不做过滤
      if (identityTags.length === 0) return true
      // 如果没有用户信息，不可见
      if (!currentUser) return false
      // OR 逻辑：任一身份标签匹配即可见
      return identityTags.some(t => {
        const userValue = currentUser[t.matchField]
        if (!userValue) return false
        if (t.matchMode === 'value') {
          // 固定值匹配（如性别标签）：用户属性 === 标签指定值
          return userValue === t.matchValue
        }
        // exact 匹配（如同事/同学）：用户属性 === 发布者快照值
        return userValue === t.matchValue
      })
    })
  }

  return filtered
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
 * 新增：自动为身份标签快照发布者的属性值
 */
async function createActivity(data) {
  // 如果标签中有身份标签，自动填入发布者的属性快照
  let tags = data.tags || []
  if (tags.length > 0) {
    let creator = null
    try {
      creator = getApp().globalData.userInfo
      if (!creator || creator._id !== data.creatorId) {
        const { data: userData } = await userCol().doc(data.creatorId).get()
        creator = userData
      }
    } catch (_) {}

    if (creator) {
      const { SYSTEM_TAGS } = mock
      tags = tags.map(tag => {
        // 如果已经是对象格式（前端组装好的）
        if (tag && typeof tag === 'object' && tag.key) {
          const def = SYSTEM_TAGS.find(t => t.key === tag.key)
          if (def && def.matchField) {
            // 快照发布者属性值
            let matchValue = tag.matchValue
            if (def.matchMode === 'exact') {
              matchValue = creator[def.matchField] || null
            } else if (def.matchMode === 'value') {
              matchValue = def.matchValue
            }
            return { key: tag.key, matchField: def.matchField, matchValue }
          }
          return { key: tag.key, matchField: null, matchValue: null }
        }
        // 兼容旧格式（纯 key 字符串）
        if (typeof tag === 'string') {
          const def = SYSTEM_TAGS.find(t => t.key === tag)
          if (def && def.matchField) {
            let matchValue = null
            if (def.matchMode === 'exact') {
              matchValue = creator[def.matchField] || null
            } else if (def.matchMode === 'value') {
              matchValue = def.matchValue
            }
            return { key: tag, matchField: def.matchField, matchValue }
          }
          return { key: tag, matchField: null, matchValue: null }
        }
        return tag
      })
    }
  }

  const newData = {
    ...data,
    tags,
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
    systemTags: mock.SYSTEM_TAGS,
    genderOptions: mock.GENDER_OPTIONS
  }
}

// ===================================================
// 漂流瓶相关（drift_bottles / drift_chats 集合）
// ===================================================

function bottleCol() {
  return db().collection('drift_bottles')
}

function chatCol() {
  return db().collection('drift_chats')
}

/**
 * 今日已丢/捞次数（用于判断配额）
 * type: 'throw' | 'fish'
 */
async function getDriftQuotaToday(userId, type) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { total } = await bottleCol()
    .where({
      [`${type}erId`]: userId,
      [`${type}At`]: db().command.gte(today.getTime())
    })
    .count()
  return total
}

/**
 * 丢漂流瓶
 */
async function throwBottle({ userId, content, tags }) {
  const used = await getDriftQuotaToday(userId, 'throw')
  if (used >= 1) throw new Error('今日丢瓶次数已用完')

  const data = {
    throwerId: userId,
    content,
    tags: tags || [],
    status: 'waiting',   // waiting / matched / ended
    matchedWith: null,
    throwAt: Date.now(),
    reportCount: 0,
    blocked: false
  }
  const { _id } = await bottleCol().add({ data })
  return { _id, ...data }
}

/**
 * 捞漂流瓶（智能匹配：兴趣标签 50% + 随机 50%，避免重复匹配）
 */
async function fishBottle(userId) {
  const used = await getDriftQuotaToday(userId, 'fish')
  if (used >= 1) throw new Error('今日捞瓶次数已用完')

  // 获取当前用户标签（来自 juwu_users）
  let myTags = []
  try {
    const me = await userCol().doc(userId).get()
    myTags = me.data.tags || []
  } catch (_) {}

  // 查询等待中的瓶子（排除自己丢的 + 已被该用户捞过的）
  const { data: candidates } = await bottleCol()
    .where({
      status: 'waiting',
      blocked: false,
      throwerId: db().command.neq(userId)
    })
    .orderBy('throwAt', 'asc')
    .limit(50)
    .get()

  if (!candidates.length) throw new Error('暂时没有漂流瓶，稍后再来')

  // 过滤已被当前用户捞过的
  const { data: fishHistory } = await bottleCol()
    .where({ fisherId: userId })
    .limit(20)
    .get()
  const fishedIds = new Set(fishHistory.map(b => b._id))
  const available = candidates.filter(b => !fishedIds.has(b._id))
  if (!available.length) throw new Error('暂时没有新的漂流瓶')

  // 智能匹配：标签重叠度排序
  const scored = available.map(b => {
    const overlap = (b.tags || []).filter(t => myTags.includes(t)).length
    const rand = Math.random()
    // 50% 标签权重 + 50% 随机
    return { bottle: b, score: overlap * 0.5 + rand * 0.5 }
  })
  scored.sort((a, b) => b.score - a.score)
  const picked = scored[0].bottle

  // 标记为已匹配
  await bottleCol().doc(picked._id).update({
    data: {
      status: 'matched',
      matchedWith: userId,
      fisherId: userId,
      fishAt: Date.now()
    }
  })

  return { ...picked, status: 'matched', matchedWith: userId }
}

/**
 * 获取我的漂流瓶列表（丢出的 + 捞到的）
 */
async function getMyBottles(userId) {
  const [thrown, fished] = await Promise.all([
    bottleCol().where({ throwerId: userId }).orderBy('throwAt', 'desc').limit(20).get(),
    bottleCol().where({ fisherId: userId }).orderBy('fishAt', 'desc').limit(20).get()
  ])
  return {
    thrown: thrown.data,
    fished: fished.data
  }
}

/**
 * 发送聊天消息
 */
async function sendDriftMessage({ bottleId, senderId, content }) {
  const sensitive = require('./sensitive')
  if (sensitive.hasSensitive(content)) throw new Error('内容包含违规词，请修改后重试')

  const data = {
    bottleId,
    senderId,
    content,
    createdAt: Date.now()
  }
  const { _id } = await chatCol().add({ data })
  return { _id, ...data }
}

/**
 * 获取漂流瓶聊天记录
 */
async function getDriftMessages(bottleId) {
  const { data } = await chatCol()
    .where({ bottleId })
    .orderBy('createdAt', 'asc')
    .limit(100)
    .get()
  return data
}

/**
 * 结束/回海漂流瓶
 */
async function endBottle(bottleId) {
  await bottleCol().doc(bottleId).update({ data: { status: 'ended' } })
}

/**
 * 举报漂流瓶
 */
async function reportBottle({ bottleId, reporterId, reason }) {
  const bottle = await bottleCol().doc(bottleId).get()
  if (!bottle.data) throw new Error('漂流瓶不存在')

  const newCount = (bottle.data.reportCount || 0) + 1
  const updates = { reportCount: newCount }
  // 累计 3 次举报自动屏蔽
  if (newCount >= 3) updates.blocked = true

  await bottleCol().doc(bottleId).update({ data: updates })

  // 记录举报（写入独立集合）
  await db().collection('drift_reports').add({
    data: { bottleId, reporterId, reason, createdAt: Date.now() }
  })

  return { blocked: newCount >= 3 }
}

/**
 * 获取今日配额剩余（丢瓶 + 捞瓶）
 */
async function getDriftQuotaStatus(userId) {
  const [thrown, fished] = await Promise.all([
    getDriftQuotaToday(userId, 'throw'),
    getDriftQuotaToday(userId, 'fish')
  ])
  return {
    canThrow: thrown < 1,
    canFish: fished < 1,
    throwRemain: Math.max(0, 1 - thrown),
    fishRemain: Math.max(0, 1 - fished)
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
  getEnums,
  // 漂流瓶
  throwBottle,
  fishBottle,
  getMyBottles,
  sendDriftMessage,
  getDriftMessages,
  endBottle,
  reportBottle,
  getDriftQuotaStatus
}
