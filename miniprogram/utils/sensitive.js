// utils/sensitive.js — 基础敏感词过滤
// 生产环境建议替换为云函数调用 + AI 内容检测

const SENSITIVE_WORDS = [
  // 广告类
  '微信号', '加我', '私聊', '威信', 'V信', '扫码',
  // 违禁类
  '赌博', '博彩', '色情', '卖号', '刷单', '兼职赚',
  // 骚扰类
  '约炮', '一夜情'
]

/**
 * 检测文本是否包含敏感词
 * @param {string} text
 * @returns {boolean}
 */
function hasSensitive(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return SENSITIVE_WORDS.some(w => lower.includes(w.toLowerCase()))
}

/**
 * 将敏感词替换为 ***
 * @param {string} text
 * @returns {string}
 */
function maskSensitive(text) {
  if (!text) return text
  let result = text
  SENSITIVE_WORDS.forEach(w => {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    result = result.replace(re, '***')
  })
  return result
}

module.exports = { hasSensitive, maskSensitive }
