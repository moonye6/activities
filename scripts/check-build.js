#!/usr/bin/env node
/**
 * check-build.js
 * 提交前自动检查微信小程序构建质量配置
 * 对应微信开发者工具「代码质量」面板的强制项
 *
 * 用法：node scripts/check-build.js
 * 在 .husky/pre-commit 中调用，失败则阻止 commit
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const CONFIG_PATH = path.join(ROOT, 'project.config.json')
const APP_JSON_PATH = path.join(ROOT, 'miniprogram', 'app.json')
const PAGES_DIR = path.join(ROOT, 'miniprogram', 'pages')

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

let errors = []
let warnings = []

function pass(msg) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`)
}
function fail(msg) {
  console.log(`  ${RED}✗${RESET} ${msg}`)
  errors.push(msg)
}
function warn(msg) {
  console.log(`  ${YELLOW}⚠${RESET} ${msg}`)
  warnings.push(msg)
}

// ── 1. 检查 project.config.json ──────────────────────────────────
console.log(`\n${BOLD}[1] project.config.json 压缩配置${RESET}`)

if (!fs.existsSync(CONFIG_PATH)) {
  fail('project.config.json 不存在')
} else {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  const s = cfg.setting || {}

  s.minified === true
    ? pass('JS 压缩 (minified: true)')
    : fail('JS 未压缩 → 请将 setting.minified 设为 true')

  s.minifyWXML === true
    ? pass('WXML 压缩 (minifyWXML: true)')
    : fail('WXML 未压缩 → 请将 setting.minifyWXML 设为 true')

  s.minifyWXSS === true
    ? pass('WXSS 压缩 (minifyWXSS: true)')
    : warn('WXSS 压缩未开启（非强制）')

  s.userConfirmedBundleSwitch === true
    ? pass('组件按需注入已确认 (userConfirmedBundleSwitch: true)')
    : fail('未确认按需注入 → 请将 setting.userConfirmedBundleSwitch 设为 true')

  s.uploadWithSourceMap === false
    ? warn('uploadWithSourceMap: false（sourcemap 不上传，可减小包体）')
    : pass('uploadWithSourceMap: true（调试友好）')
}

// ── 2. 检查 app.json lazyCodeLoading ─────────────────────────────
console.log(`\n${BOLD}[2] app.json 组件按需注入${RESET}`)

if (!fs.existsSync(APP_JSON_PATH)) {
  fail('miniprogram/app.json 不存在')
} else {
  const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'))

  appJson.lazyCodeLoading === 'requiredComponents'
    ? pass('lazyCodeLoading: "requiredComponents" 已启用')
    : fail('未启用按需注入 → app.json 需添加 "lazyCodeLoading": "requiredComponents"')

  const globalComps = Object.keys(appJson.usingComponents || {})
  if (globalComps.length > 0) {
    warn(`app.json 存在 ${globalComps.length} 个全局组件（${globalComps.join(', ')}），建议移至各页面按需声明`)
  } else {
    pass('app.json 无全局组件注册（按需注入最佳实践）')
  }
}

// ── 3. 检查各页面 json 是否声明 usingComponents ───────────────────
console.log(`\n${BOLD}[3] 页面 usingComponents 声明${RESET}`)

if (fs.existsSync(PAGES_DIR)) {
  const pageDirs = fs.readdirSync(PAGES_DIR).filter(d =>
    fs.statSync(path.join(PAGES_DIR, d)).isDirectory()
  )

  pageDirs.forEach(pageDir => {
    const sub = path.join(PAGES_DIR, pageDir)
    const files = fs.readdirSync(sub).filter(f => f.endsWith('.json'))

    files.forEach(jsonFile => {
      const p = path.join(sub, jsonFile)
      try {
        const j = JSON.parse(fs.readFileSync(p, 'utf8'))
        if (j.component) return // 这是组件，不是页面
        if (!('usingComponents' in j)) {
          warn(`pages/${pageDir}/${jsonFile} 缺少 usingComponents 字段`)
        } else {
          pass(`pages/${pageDir}/${jsonFile} ✓`)
        }
      } catch (e) {
        fail(`pages/${pageDir}/${jsonFile} JSON 解析失败：${e.message}`)
      }
    })
  })
}

// ── 4. 检查图片资源（超过 200K 提醒）────────────────────────────
console.log(`\n${BOLD}[4] 图片资源大小检查（>200K 警告）${RESET}`)

const ASSETS_DIRS = [
  path.join(ROOT, 'miniprogram', 'assets'),
  path.join(ROOT, 'resources')
]

let hasImgWarning = false
ASSETS_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) return
  const walk = (d) => {
    fs.readdirSync(d).forEach(f => {
      const fp = path.join(d, f)
      const stat = fs.statSync(fp)
      if (stat.isDirectory()) { walk(fp); return }
      const ext = path.extname(f).toLowerCase()
      if (['.png','.jpg','.jpeg','.gif','.webp','.mp3','.mp4'].includes(ext)) {
        const kb = (stat.size / 1024).toFixed(1)
        if (stat.size > 200 * 1024) {
          warn(`${fp.replace(ROOT + '/', '')} 大小 ${kb}K > 200K，建议压缩`)
          hasImgWarning = true
        }
      }
    })
  }
  walk(dir)
})
if (!hasImgWarning) pass('所有图片/音频资源均 ≤ 200K')

// ── 汇总 ─────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50))
if (errors.length === 0) {
  console.log(`${GREEN}${BOLD}✓ 所有检查通过，可以提交！${RESET}`)
  if (warnings.length > 0) {
    console.log(`${YELLOW}  ${warnings.length} 条建议，不阻塞提交${RESET}`)
  }
  process.exit(0)
} else {
  console.log(`${RED}${BOLD}✗ 发现 ${errors.length} 个问题，提交被阻止：${RESET}`)
  errors.forEach(e => console.log(`  ${RED}• ${e}${RESET}`))
  console.log(`\n修复后重新 git add 相关文件再 commit\n`)
  process.exit(1)
}
