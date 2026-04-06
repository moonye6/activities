---
name: green-theme-redesign
overview: 将小程序主题从「活力橙」切换为「清爽绿」，同步更新设计规范文档和所有样式文件。
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
    background:
      - "#F7F8FA"
      - "#FFFFFF"
      - "#E8FAF0"
    text:
      - "#1A1A2E"
      - "#6B7280"
      - "#B0B7C3"
    functional:
      - "#07C160"
      - "#FF3B30"
      - "#FF9500"
      - "#3B82F6"
todos:
  - id: update-prd-design-spec
    content: 在 docs/prd1.md 新增第八章设计规范，记录清爽绿 Design Token、色彩系统、圆角阴影字体间距规范
    status: pending
  - id: update-app-wxss
    content: "修改 app.wxss 全局 CSS 变量，主色系从活力橙替换为清爽绿 #07C160"
    status: pending
    dependencies:
      - update-prd-design-spec
  - id: update-page-wxss
    content: 修改 index/profile/create/detail 各页面 wxss 中硬编码橙色值，同步替换为绿色系
    status: pending
    dependencies:
      - update-app-wxss
---

## 用户需求

将小程序视觉主色从「活力橙」切换为「清爽绿」风格，分两步执行：

### 第一步：沉淀文档

在 `docs/prd1.md` 中新增「设计规范」章节，记录清爽绿色系的完整 Design Token，包括主色、背景色、文字色、功能色、圆角、阴影、字体、间距规范，作为后续开发和迭代的基准文档。

### 第二步：执行开发

按照设计文档，将全部样式文件的橙色系替换为绿色系：

- 全局 CSS 变量（`app.wxss`）主色替换
- 首页、创建页、详情页、个人页各 `.wxss` 中硬编码的橙色渐变和色值替换
- profile 页头部背景渐变（`#FF6B35 / #FF8C5A / #FFB347`）替换为绿色渐变
- FAB 按钮、主按钮、进度条、标签、加载动画等所有引用主色的组件同步更新

### 视觉风格要求

- 主色：清爽绿 `#07C160`（微信生态绿，符合平台调性）
- 背景：浅灰白 `#F7F8FA` 不变
- 大圆角、柔和阴影、PingFang SC 字体保持不变
- 所有交互反馈色（active、shadow）同步换绿

## 技术栈

微信小程序原生开发，纯 WXSS 样式修改，无逻辑代码变动。

## 实现方案

### CSS 变量策略

`app.wxss` 中的 `page{}` 已定义完整的 CSS 变量体系，绝大多数颜色通过 `var(--color-primary)` 引用，只需修改变量定义即可全局生效。需要额外处理的是各页面 `.wxss` 中的**硬编码色值**。

### 硬编码色值清单（需逐一替换）

| 文件 | 硬编码色值 | 替换为 |
| --- | --- | --- |
| `profile.wxss` | `#FF6B35 / #FF8C5A / #FFB347`（头部渐变） | `#07C160 / #0FD970 / #38E98A` |
| `profile.wxss` | `#FF6B35`（昵称确认按钮） | `#07C160` |
| `index.wxss` | `rgba(255,107,53,0.25)`（FAB active shadow） | `rgba(7,193,96,0.25)` |
| `activity-card.wxss` | 无硬编码主色（已用变量） | 无需改 |
| `detail.wxss` | loading spinner `border-top-color` 已用变量 | 无需改 |


### 清爽绿 Design Token 定义

```
--color-primary:       #07C160   /* 微信生态绿，主操作色 */
--color-primary-light: #0FD970   /* 浅一档，渐变终点 */
--color-primary-pale:  #E8FAF0   /* 极浅绿，标签背景、选中背景 */
--color-primary-bg:    #F0FBF5   /* 页面级浅绿背景区 */
--color-primary-deep:  #059A4C   /* 深绿，按压态 */
--shadow-primary:      0 8rpx 28rpx rgba(7,193,96,0.28)
```

## 实现说明

- 所有修改仅涉及 `.wxss` 文件和 `docs/prd1.md`，不触碰任何 `.js` / `.wxml` / `.json`
- `activity-card` 的左侧色条颜色来自活动类型（`util.js` 中定义），与主色无关，不做修改
- `detail.wxss` 的封面渐变是活动类型色（非主色），不修改

## 目录结构

```
docs/
└── prd1.md                    [MODIFY] 新增第八章「设计规范」

miniprogram/
├── app.wxss                   [MODIFY] CSS 变量主色系替换为清爽绿
├── pages/
│   ├── index/index.wxss       [MODIFY] FAB active shadow 硬编码色替换
│   ├── profile/profile.wxss   [MODIFY] 头部渐变、昵称按钮硬编码橙色替换
│   ├── create/create.wxss     [VERIFY] 全部用变量，确认无硬编码（预计无需改）
│   └── detail/detail.wxss     [VERIFY] 全部用变量，确认无硬编码（预计无需改）
```

## 清爽绿设计风格

整体延续现有「大圆角现代卡片流」设计语言，将主色调从活力橙切换为清爽绿。绿色选用微信生态原生绿 `#07C160`，与微信平台高度融合，传递「顺利、清爽、活跃」的产品气质。

### 核心页面色彩更新

**首页**

- Navbar 底部 border、Tab 激活下划线、Badge 背景：全部换绿
- FAB 按钮：绿色渐变 + 绿色投影

**个人页**

- 头部背景渐变：`#07C160 → #0FD970 → #38E98A`，清新明快
- 统计数字：绿色高亮
- 昵称确认按钮：绿色文字

**创建页**

- 选中态高亮、步进器加号按钮、可见范围激活项：绿色
- 发布按钮：绿色渐变

**活动详情页**

- 进度条填充色（成局进度）：绿色
- 参与状态激活色：保持语义色不变（参加=绿、拒绝=红、暂定=橙）