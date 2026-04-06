---
name: green-theme-redesign
overview: 全范围视觉重设计：清爽绿主题切换 + 交互升级（环形进度条、可见范围图标、发布页大字标题、空状态插画），同步沉淀设计规范文档。
design:
  architecture:
    component: tdesign
  styleKeywords:
    - 清爽绿
    - 微信生态
    - 大圆角卡片
    - 柔和阴影
    - 呼吸感留白
    - 克制亲和
    - 图标条件反射
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 40rpx
      weight: 700
    subheading:
      size: 32rpx
      weight: 600
    body:
      size: 28rpx
      weight: 400
  colorSystem:
    primary:
      - "#07C160"
      - "#0FD970"
      - "#059A4C"
      - "#E8FAF0"
    background:
      - "#F7F8FA"
      - "#FFFFFF"
      - "#F0FBF5"
    text:
      - "#1A1A2E"
      - "#6B7280"
      - "#B0B7C3"
      - "#FFFFFF"
    functional:
      - "#07C160"
      - "#FF3B30"
      - "#FF9500"
      - "#3B82F6"
todos:
  - id: update-prd-doc
    content: 在 docs/prd1.md 末尾新增第八章设计规范和第九章交互规范，完整记录清爽绿 Token 和交互原则
    status: completed
  - id: update-global-styles
    content: 修改 app.wxss 主色系变量换绿，修复 activity-card.wxss 和 create.wxss 中 --color-white 未定义 bug
    status: completed
    dependencies:
      - update-prd-doc
  - id: update-mock-and-create-page
    content: 修改 mock.js 可见范围加 icon 字段，升级 create.wxml/wxss 大字引导语、图标可见范围选项、可选字段弱化
    status: completed
    dependencies:
      - update-global-styles
  - id: update-index-empty-state
    content: 升级 index.wxml/wxss 空状态为纯 CSS 引导型插画，替换 FAB active shadow 硬编码色
    status: completed
    dependencies:
      - update-global-styles
  - id: update-detail-ring-progress
    content: 升级 detail.wxml/wxss 线性进度条为环形进度条，添加参与按钮物理回弹动画
    status: completed
    dependencies:
      - update-global-styles
  - id: update-profile-styles
    content: 修改 profile.wxss 头部渐变和昵称按钮色从橙色换为绿色
    status: completed
    dependencies:
      - update-global-styles
---

## 用户需求

将「活动圈」小程序视觉主色从活力橙切换为清爽绿，分文档沉淀和开发执行两阶段完成，范围包含全部改动。

## 产品概述

面向熟人社交的轻量活动组织小程序，本次重点是全面视觉升级：将主色调换为微信生态绿 `#07C160`，并同步完成多处交互体验提升，最终形成设计规范文档沉淀。

## 核心功能改动

### 文档沉淀

- `docs/prd1.md` 新增第八章「设计规范」：Design Token（色彩/圆角/阴影/字体/间距）完整记录
- 新增第九章「交互规范」：分段渐进表单原则、图标条件反射原则、引导型空状态原则、物理回弹反馈原则

### 全局主色替换

- `app.wxss` CSS 变量主色系从橙色系全部换为清爽绿；修复 `--color-white` 变量缺失问题（应为 `--color-surface`）
- `activity-card.wxss` 和 `create.wxss` 中 `var(--color-white)` 同步修复

### 发布页体验升级（create）

- 顶部新增大字引导语「今天想约点什么？」，视觉上消除填表压力
- 可见范围选项加图标（朋友可见 👥 / 公开 🌐 / 指定标签 🏷️），`mock.js` 中 `VISIBILITY_OPTIONS` 加 `icon` 字段
- 可选字段（地点）视觉弱化：字号降小、颜色置灰

### 活动详情页升级（detail）

- 线性进度条替换为环形进度条（CSS `conic-gradient` 实现），直观展示成局进度
- 参与按钮点击加物理回弹动画（`scale(0.94)` 弹回 `scale(1.02)` 再归位）

### 首页空状态升级（index）

- 空状态区从纯文字 emoji 升级为纯 CSS + 文字组合的引导型插画（落单小球风格）
- 引导文案更具召唤感，按钮更突出

### 个人页（profile）

- 头部背景渐变从橙色系换为绿色系
- 昵称确认按钮文字色换绿

## 技术栈

微信小程序原生开发（WXML + WXSS + JS），无框架变动，无新依赖引入。

## 实现方案

### 策略概述

改动分三个层次：CSS 变量全局替换（主色系）、硬编码色值逐一修复、结构性 UI 升级（环形进度条 / 空状态插画 / 发布页引导语）。CSS 变量层的改动通过修改 `app.wxss` 中 `page{}` 下的 token 定义即可全局生效，无需逐页修改；结构性改动需同时修改 `.wxml` 和 `.wxss`；JS 改动仅限 `mock.js` 加 `icon` 字段，不涉及业务逻辑。

### 环形进度条方案

微信小程序（基础库 ≥ 2.9.0）支持 `conic-gradient`，直接用 CSS 实现，无需自定义组件：

```
/* 环形进度条核心实现 */
.ring-progress {
  width: 120rpx; height: 120rpx;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary) calc(var(--pct) * 1%),
    var(--color-bg) 0
  );
}
/* 内圆镂空 */
.ring-progress::after {
  content: ''; position: absolute; inset: 16rpx;
  background: var(--color-surface); border-radius: 50%;
}
```

`progressPct` 值已在 `detail.js` 中计算好，通过 `style="--pct:{{progressPct}}"` 内联 CSS 变量传入即可，不需要改动 JS。

### 空状态插画方案

纯 CSS 实现「落单小球」：用 `border-radius: 50%` 的圆形 view 模拟小球，配合柔和阴影和底部投影椭圆，形成立体感。动画使用 `@keyframes` 实现轻微浮动效果（`translateY(-8rpx)` 循环）。

### 物理回弹动画

WXSS 中用 `transition` 无法实现回弹，使用微信小程序 `animation` API 或直接用 `@keyframes`：

```css
@keyframes btn-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.94); }
  70%  { transform: scale(1.03); }
  100% { transform: scale(1); }
}
.rsvp-btn:active { animation: btn-bounce 0.3s ease; }
```

## 实现说明

- **`--color-white` bug**：`activity-card.wxss` 第 8 行和 `create.wxss` 中 `visibility-item` 均引用了未定义变量 `var(--color-white)`，替换为 `var(--color-surface)` 修复渲染异常
- **`COVER_GRADIENTS.dinner` 橙色**：该色属于活动类型语义色（晚餐=橙），与主题无关，不修改
- **`conic-gradient` 兼容性**：微信开发者工具 3.x + 基础库 2.9.0+ 均已支持，当前项目 `libVersion: 3.7.8` 完全满足
- **`icon` 字段传递路径**：`mock.js` → `api.getEnums()` → `create.js` `visibilityOptions` → `create.wxml` 渲染，仅需在 `mock.js` 中加字段，WXML 直接用 `{{item.icon}}` 展示

## 架构设计

```mermaid
graph TD
    A[docs/prd1.md] -->|设计规范文档| B[Design Token]
    B --> C[app.wxss 全局变量]
    C -->|var --color-primary| D[所有页面 WXSS 自动生效]
    E[mock.js VISIBILITY_OPTIONS +icon] --> F[api.getEnums]
    F --> G[create.js visibilityOptions]
    G --> H[create.wxml 图标渲染]
    I[detail.js progressPct 已有] -->|style --pct:{{progressPct}}| J[detail.wxml 环形进度条]
    J --> K[detail.wxss conic-gradient]
```

## 目录结构

```
docs/
└── prd1.md                                    [MODIFY] 新增第八章设计规范（Design Token 色彩/圆角/阴影/字体/间距）
                                                         新增第九章交互规范（渐进表单/图标条件反射/引导空状态/物理回弹）

miniprogram/
├── app.wxss                                   [MODIFY] 主色系 CSS 变量全部替换为清爽绿
                                                         shadow-primary 替换为绿色阴影
                                                         btn-primary active 态阴影换绿

├── utils/
│   └── mock.js                                [MODIFY] VISIBILITY_OPTIONS 三项各加 icon 字段
│                                                        （friends→'👥', public→'🌐', tags→'🏷️'）

├── pages/
│   ├── index/
│   │   ├── index.wxml                         [MODIFY] 空状态区替换为引导型插画结构
│   │   │                                               （.empty-ball 球体 + .empty-shadow 投影 + 引导按钮）
│   │   └── index.wxss                         [MODIFY] FAB active shadow rgba 换绿
│   │                                                    新增 empty-ball / empty-shadow / 浮动动画样式
│   │
│   ├── create/
│   │   ├── create.wxml                        [MODIFY] 顶部新增大字引导语 view「今天想约点什么？」
│   │   │                                               可见范围 visibility-item 加 icon text 展示
│   │   └── create.wxss                        [MODIFY] var(--color-white) → var(--color-surface) 修复
│   │                                                    新增 .create-hero 大字标题样式
│   │                                                    .form-cell--optional 可选字段弱化样式
│   │
│   ├── detail/
│   │   ├── detail.wxml                        [MODIFY] participants-progress 区替换为环形进度条结构
│   │   │                                               （.ring-wrap + .ring-progress + .ring-inner 文字）
│   │   └── detail.wxss                        [MODIFY] 线性进度条样式替换为环形进度条 conic-gradient 方案
│   │                                                    rsvp-btn active 态换为 btn-bounce 回弹动画
│   │
│   └── profile/
│       └── profile.wxss                       [MODIFY] header-bg 渐变从橙色换为绿色
│                                                        nick-confirm-btn 文字色从 #FF6B35 换为 #07C160

└── components/
    └── activity-card/
        └── activity-card.wxss                 [MODIFY] var(--color-white) → var(--color-surface) 修复
```

## 设计风格

整体采用「清爽绿 + 大圆角现代卡片流」设计语言，延续现有布局结构，将主色调从活力橙切换为微信生态绿 `#07C160`。绿色传递「顺利、清爽、活跃」的产品气质，与微信原生界面高度融合，用户无需重新适应。

### 各页面色彩更新要点

**首页**

- FAB 按钮绿色渐变 + 绿色投影
- 空状态区：一个带浮动动画的圆形「小球」（绿色系），底部椭圆投影，引导语「还没有活动，来发起第一个吧」，按钮高饱和度绿色

**发布页**

- 顶部大字引导语「今天想约点什么？」（40rpx/700），营造轻松感
- 必填字段正常权重；地点（可选）用 `#B0B7C3` 淡灰色 + 24rpx 字号弱化
- 可见范围图标：👥 朋友可见 / 🌐 公开 / 🏷️ 指定标签，图标在上文字在下，激活态绿色高亮

**活动详情页**

- 环形进度条（120rpx 外径，`conic-gradient` 绿色填充），中心显示百分比数字，替代原线性进度条
- 参与按钮点击有物理回弹动画（0.3s），「确认参加」激活态高饱和度绿色填充

**个人页**

- 头部渐变：`#07C160 → #0FD970 → #38E98A`，清新明快
- 统计数字绿色高亮，与头部渐变呼应

### 设计原则

- 拒绝信息过载，保持充足留白（8rpx 倍数间距原则）
- 核心字段（时间、类型）视觉最突出；可选字段做减法
- 图标优先于文字，降低阅读负担
- 微动效克制，仅在关键交互（参与/发布）处使用