# 更新档案 · Update Log

记录每一次对 **dsh-cosmogram** 的改动：什么时候、用什么工具、改了哪里、怎么验证的。
新条目追加到「更新记录」末尾；**不要改写历史条目**，写错了就再追加一条更正。

- 项目根：本文件所在目录（`dsh-cosmogram/`）
- 版本号：见 `package.json` 的 `version`；对外发布说明见 `CHANGELOG.md`
- 时间基准：Asia/Shanghai（UTC+8）
- 提交哈希：见 `git log`；条目里只记提交信息，不引用自己的哈希（否则改一次哈希就失效）
- 性质区别：`CHANGELOG.md` 面向使用者写「版本有什么变化」，本文件面向维护写「谁在什么时候用什么工具动了什么」

## 字段说明

| 字段 | 含义 |
| --- | --- |
| 时间 | 改动发生的本地时间，格式 `YYYY-MM-DD HH:mm` |
| 版本 | 改动完成后的 `package.json` 版本 |
| 工具 | 实际执行改动的工具：`bash`、`write`、`edit`、`git`、`npm`、`node`、`plugin_manager`、`plugin_market` 等，多个用 `/` 分隔 |
| 类型 | `feat` 新功能 / `fix` 修复 / `docs` 文档 / `chore` 维护 / `meta` 发布相关 |
| 改动 | 一句话说清做了什么，不写「优化」「完善」这类看不出内容的词 |
| 影响文件 | 具体路径，新增写 `+`，删除写 `-`，修改不标记 |
| 校验 | 这次实际跑过的检查与结果；没跑就写「未校验」 |

## 更新记录

| # | 时间 | 版本 | 工具 | 类型 | 改动 | 影响文件 | 校验 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | 2026-11-19 21:45 | 0.1.0 | bash / edit / write / git / node / npm | chore | 插件项目迁入 `dsh-cosmogram/` 作为唯一发布根，分支改 `main`，忽略打包产物，建立本档案 | 全部（移动）；`.gitignore`；`+UPDATES.md` | 30 个测试通过；`npm run check` 通过；`npm pack --dry-run` 18 files / 92.9 kB |

### 001 · 2026-11-19 21:45 · 整理为可发布目录（v0.1.0 基线）

**用什么工具**

- `bash`：`mkdir` / `mv`，把工作区里的项目整体迁入 `dsh-cosmogram/`，`.git` 一并迁入
- `edit`：`.gitignore` 增加 `*.tgz`
- `write`：新增本文件 `UPDATES.md`
- `git`：`branch -m main`、`add`、`commit`
- `node` / `npm`：`npm test`、`npm run check`、`npm pack --dry-run`

**改了什么**

1. 项目根迁入 `dsh-cosmogram/`。仓库历史（4 条提交）与全部跟踪文件随 `.git` 一起搬迁，相对路径不变，`git status` 干净。
2. 分支 `master` → `main`：`.github/workflows/ci.yml` 只在 `push: branches: [main]` 触发，原分支名会让 CI 永远不跑。
3. `.gitignore` 增加 `*.tgz`：`npm pack` 的产物不该进仓库。
4. 新增本更新档案，并写入发布清单与待办。

**没有改动**：`index.js`、`lib/*`、`assets/cosmogram.md`、`references/*`、`prompts/*`、`locale/*`、`icon.svg`、`cordis.patch.yml`、`package.json`、测试逻辑，全部保持 v0.1.0 原样。

**校验**

- `npm test`：30 个测试全部通过（intake 16 / manifest 9 / plugin 5）
- `npm run check`：4 个模块语法检查通过
- `npm pack --dry-run`：18 个文件、解包 92.9 kB，`locale`、`icon.svg`、`assets`、`references`、`prompts` 均在包内
- `git status`：干净；`git log`：4 条历史完整

**发布状态**：未上传，等待 GitHub 仓库地址。

---

## 上传清单（照这个传，别的都不用传）

上传的文件夹就是 **`dsh-cosmogram/`** 这一整个目录（含 `.git`）。父目录不要传。

| 路径 | 作用 | 是否上传 |
| --- | --- | --- |
| `package.json` | 包清单：`dsh.bundle` 声明、`files` 白名单、脚本 | ✅ |
| `cordis.patch.yml` | bundle 补丁，插件管理器据此挂载 | ✅ |
| `index.js` | 插件入口，注册技能与工具 | ✅ |
| `lib/intake.js` | 输入校验、体系识别、骨架生成 | ✅ |
| `lib/tool.js` | `cosmogram_intake` 工具定义 | ✅ |
| `lib/skill.js` | `cosmogram` 技能注册 | ✅ |
| `assets/cosmogram.md` | 技能正文（解读契约） | ✅ |
| `references/systems.md` | 九体系参考手册 | ✅ |
| `references/output-and-safety.md` | 输出范例、语气、安全边界 | ✅ |
| `prompts/` | 给非 DSH 用户的通用提示词包 | ✅ |
| `locale/en.json`、`locale/zh.json` | 插件页标题与描述 | ✅ |
| `icon.svg` | 插件图标 | ✅ |
| `test/` | 30 个零依赖测试 | ✅ |
| `.github/workflows/ci.yml` | GitHub Actions | ✅ |
| `README.md`、`README.zh.md` | 双语说明 | ✅ |
| `CHANGELOG.md` | 版本变更 | ✅ |
| `CONTRIBUTING.md` | 参与约定 | ✅ |
| `LICENSE` | MIT | ✅ |
| `.gitignore` | 忽略规则 | ✅ |
| `UPDATES.md` | 本档案 | ✅ |
| `.git/` | 提交历史 | ✅（`git push` 自动带上，不要手动删） |
| `node_modules/`、`.DS_Store`、`*.log`、`*.tgz`、`coverage/` | 本地产物 | ❌ 已在 `.gitignore` 排除 |

## 发布待办

- [ ] 在 GitHub 建空仓库（不勾 README / .gitignore），`git remote add origin` 后推 `main`
- [ ] `package.json` 补 `repository` 与 `homepage`（需要 GitHub 用户名，目前留空）
- [ ] 打 `v0.1.0` tag，Release 附件放 `dsh-cosmogram-0.1.0.tgz`
- [ ] 仓库加 `dsh-plugin`、`deepseek-harness` 等 topics
- [ ] 可选：`npm publish --registry=https://registry.npmjs.org --access public`
- [ ] 可选：提交 awesome-dsh-plugin 收录（要求仓库创建满 1 天）
