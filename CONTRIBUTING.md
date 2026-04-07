# 提交规范（CONTRIBUTING）

## 一、Git 提交前自动检查

项目使用 **husky** 在每次 `git commit` 前自动运行构建质量检查，确保不会把「代码质量未通过」的配置提交到仓库。

### 首次配置（clone 后执行一次）

```bash
npm install          # 安装 husky
npm run prepare      # 激活 pre-commit hook
```

> 如果不想使用 npm，也可手动运行检查：
> ```bash
> node scripts/check-build.js
> ```

---

## 二、检查项说明

`scripts/check-build.js` 覆盖微信开发者工具「代码质量」面板的 **3 个强制项**：

| 检查项 | 对应配置 | 说明 |
|---|---|---|
| JS 文件压缩 | `project.config.json` → `setting.minified: true` | 减小主包体积 |
| WXML 文件压缩 | `project.config.json` → `setting.minifyWXML: true` | 减小主包体积 |
| 组件按需注入 | `app.json` → `lazyCodeLoading: "requiredComponents"` + `project.config.json` → `setting.userConfirmedBundleSwitch: true` | 首屏只注入当前页面组件 |

此外还有**警告级**检查（不阻塞提交，但建议处理）：

- 图片/音频资源 > 200K
- `app.json` 存在全局组件注册（影响按需注入效果）

---

## 三、Git 提交信息规范

格式：`<type>(<scope>): <subject>`

### type 枚举

| type | 场景 |
|---|---|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `style` | 样式调整（不影响逻辑） |
| `refactor` | 重构（不新增功能/修复 bug） |
| `perf` | 性能优化 |
| `chore` | 构建配置、依赖更新 |
| `docs` | 文档变更 |
| `revert` | 回滚 |

### scope 枚举（可选）

`index` / `create` / `detail` / `profile` / `drift` / `components` / `utils` / `api` / `config`

### 示例

```
feat(drift): 新增漂流瓶丢/捞功能及一对一聊天页
fix(index): 修复首页活动列表加载时序问题
chore(config): 开启 JS/WXML 压缩，启用组件按需注入
perf(drift): 聊天轮询改为订阅消息减少请求次数
```

---

## 四、「无使用或无依赖文件」治理

微信开发者工具会扫描未被引用的文件，避免产生此类问题：

1. **新建页面**：必须在 `app.json` → `pages` 中注册
2. **新建组件**：必须在使用它的页面 `json` → `usingComponents` 中声明（不要注册到 `app.json` 全局）
3. **删除文件**：同步删除所有引用（`app.json` / 页面 json / wxml import 等）
4. **图片资源**：放入 `miniprogram/assets/` 目录，使用相对路径引用；原始大图（如 `icon-raw.png`）放 `resources/` 并加入 `.gitignore`

---

## 五、上传前检查清单

在微信开发者工具点击「上传」前，请确认：

- [ ] `node scripts/check-build.js` 全部通过
- [ ] 微信开发者工具「代码质量」扫描无「未通过」项
- [ ] 主包大小 < 2MB（可分包则分包）
- [ ] `resources/` 下的原始素材不打包进小程序（已在 `packOptions.ignore` 中排除）
