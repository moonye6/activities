# 活动圈 - 活动组织小程序

一款面向熟人社交的活动组织微信小程序，帮助用户以极低成本发起活动、精准匹配参与者，减少沟通成本，提升活动成功率。

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/moonye6/activities.git
cd activities
```

### 2. 用微信开发者工具打开

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开开发者工具 → 导入项目
3. 目录选择本仓库根目录（`/activities`）
4. **⚠️ 需要你介入：** 填写你的微信小程序 AppID

### 3. 填写 AppID（必须）

在导入项目时，将 AppID 填写为你自己的小程序 AppID。如果没有 AppID：
- 前往 [微信公众平台](https://mp.weixin.qq.com) 注册小程序账号
- 在「开发」→「开发管理」→「开发设置」中获取 AppID

填写后，工具会自动更新 `project.config.json` 中的 `appid` 字段。

### 4. MVP 运行说明

MVP 阶段使用本地 mock 数据，**无需配置任何后端**，直接在开发者工具中点击「编译」即可预览完整流程。

---

## MVP 功能

| 页面 | 功能 |
|------|------|
| 首页（活动列表） | 全部/我发起/我参与 Tab 切换，活动卡片流 |
| 创建活动 | 填写标题/时间/地点/类型/可见范围/标签/人数 |
| 活动详情 | 参与者列表、RSVP 操作（参加/暂定/拒绝） |
| 个人中心 | 头像昵称、活动统计、历史记录 |

---

## 接入真实后端（生产环境）

MVP 阶段所有数据读写通过 `miniprogram/utils/api.js` 统一代理，内部调用 `utils/mock.js`。
接入微信云开发只需修改 `api.js` 一处：

### Step 1：开通云开发

在微信开发者工具中点击「云开发」→ 开通，记录**云开发环境 ID**。

### Step 2：更新配置

```js
// miniprogram/app.js
globalData: {
  cloudEnvId: 'YOUR_REAL_CLOUD_ENV_ID'  // 替换为真实环境 ID
}
```

取消 `app.js` 中 `wx.cloud.init()` 的注释。

### Step 3：切换 api.js

将 `miniprogram/utils/api.js` 中的 `USE_CLOUD` 常量改为 `true`：

```js
const USE_CLOUD = true  // 改这一行即可
```

### Step 4：创建云数据库集合

在云开发控制台创建以下集合：
- `activities` — 活动数据
- `users` — 用户数据

---

## 项目结构

```
activities/
├── miniprogram/
│   ├── app.js/json/wxss          # 全局配置
│   ├── utils/
│   │   ├── mock.js               # mock 数据
│   │   ├── api.js                # 数据抽象层（切换云开发只改这里）
│   │   └── util.js               # 工具函数
│   ├── components/
│   │   ├── activity-card/        # 活动卡片组件
│   │   └── tag-selector/         # 标签选择组件
│   └── pages/
│       ├── index/                # 首页
│       ├── create/               # 创建活动
│       ├── detail/               # 活动详情
│       ├── profile/              # 个人中心
│       └── activity-type/        # 活动类型选择
├── project.config.json           # 项目配置（appid 需填写）
└── docs/
    └── prd1.md                   # 产品需求文档
```

---

## 数据结构

### Activity

```js
{
  _id: 'act_001',
  title: '周五一起吃火锅',
  type: 'dinner',          // dinner/sport/party/movie/course/other
  time: '2026-04-10 19:00',
  location: '三里屯',
  visibility: 'friends',   // friends/public/tags
  tags: ['同事', '吃货'],
  maxCount: 6,
  creatorId: 'user_001',
  status: 'recruiting',    // recruiting/confirmed/ended/cancelled
  rsvps: [
    { userId: 'user_002', status: 'yes' },   // yes/maybe/no
    { userId: 'user_003', status: 'maybe' }
  ],
  createdAt: 1744000000000
}
```

---

## 开发规范

- 颜色主色：`#FF6B35`（橙色）
- 字体：PingFang SC
- 组件：微信原生组件 + 自定义组件
- 数据层：统一通过 `utils/api.js` 调用，页面不直接操作 mock/云开发
