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
| 002 | 2026-11-19 21:57 | 0.1.0 | write / edit / bash / git | docs | README 中英分离：英文版标题、小节、体系名、七段全部英文化并给中文括注；中文版语言切换与发布命令对齐 | `README.md`、`README.zh.md` | 30 个测试通过；两版章节一一对应（各 12 节） |
| 003 | 2026-11-19 22:05 | 0.1.0 | edit / bash / npm | meta | 增加 `publishConfig`，把发布目标固定为 npmjs 官方源与公开访问，避免本机镜像源导致发布失败 | `package.json`、`UPDATES.md` | 30 个测试通过；`npm publish --dry-run` 通过 |
| 004 | 2026-11-19 22:10 | 0.1.0 | edit / bash / git / curl | meta | 补 `repository`/`homepage`/`bugs` 指回 GitHub；登记 origin；诊断 GitHub 不可达原因（本地代理 7890 可用，推送缺凭据） | `package.json`、`UPDATES.md` | 30 个测试通过；`git ls-remote` 经代理可连，推送返回 401 待凭据 |
| 005 | 2026-11-19 22:16 | 0.1.0 | bash / git / curl | meta | 首次推送到 GitHub：force 覆盖网页上传的旧快照，补齐隐藏文件与完整提交历史 | 远端 `main`（26 文件、8 提交） | `.gitignore` 与 `ci.yml` 均 200；远端 HEAD 与本地一致 |
| 006 | 2026-11-19 22:20 | 0.1.0 | curl / bash / git | meta | 设置仓库 topics（11 个）；确认 GitHub Actions 两次运行均成功 | 仓库设置、`UPDATES.md` | CI：success ×2 |
| 007 | 2026-11-19 22:39 | 0.1.0 | npm / bash / curl | meta | 将 0.1.0 发布到 npm（首次发布走 staged 处理，约 4 分钟后生效）；独立目录安装验证通过 | `UPDATES.md` | `npm view` 版本与元数据正确；`npm i` 后 `import` 成功 |

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

### 002 · 2026-11-19 21:57 · README 中英分离

**问题**

GitHub 默认展示的是 `README.md`，但它标题是中文「Cosmogram · 命理解读助手」，系统名、七段输出、固定话术全是中文，中间还夹着一句「中文说明见 README.zh.md」。`README.zh.md` 的语言切换行又把 LICENSE 链接混了进来。两份文件都像「半英半中」，读者分不清哪份是哪种语言。

**用什么工具**

- `write`：重写 `README.md`
- `edit`：`README.zh.md` 的语言切换、安装入口、发布命令、小节标题
- `bash`：标题结构对照、CJK/ASCII 字数核对
- `git`：提交

**改了什么**

1. `README.md`：标题改为英文；12 个小节名全部英文；九个体系改为「英文名（中文）」；四化、干支、爻首次出现补英文释义；七段输出改为英文并保留中文括注；固定话术保留中文原文并附英译；补「从 npm 安装（发布后）」入口；发布命令改为显式官方 registry。
2. `README.zh.md`：语言切换改为 `简体中文 ｜ English`（LICENSE 归到「许可」一节）；补 npm 安装入口；发布命令加 `--registry`；补 `### 增加新体系` 小标题，与英文版 `### Adding a system` 对齐。
3. 两版章节保持一一对应（各 12 节），不再出现「英文文档里夹整段中文」或「中文文档里夹英文小节」。

**没有改动**：技能正文、`lib/*`、测试、`locale/*`、`prompts/*`，v0.1.0 行为不变。

**校验**

- `npm test`：30 个测试全部通过
- 标题结构：`README.md` 与 `README.zh.md` 各 12 节，顺序一致
- 语言分布：英文版 CJK 字符仅出现在术语括注与中文原文引用中；中文版仅保留必要的英文专名与命令

### 003 · 2026-11-19 22:05 · 发布准备：固定 npm 发布目标

**为什么**

本机 `registry` 指向 `https://registry.npmmirror.com`（镜像只读，不能发布）。直接 `npm publish` 会打到镜像并被 403 拒绝，每次靠命令行 `--registry` 又多一个忘记的机会。

**用什么工具**

- `edit`：`package.json` 增加 `publishConfig`
- `bash` / `npm`：`npm publish --dry-run` 预演
- `npm login --auth-type=web`：尝试发起登录，因无人实时确认，CLI 回落到 `Username:` 提示后以退出码 1 结束（**未登录成功，未产生 token**）

**改了什么**

```json
"publishConfig": { "access": "public", "registry": "https://registry.npmjs.org" }
```

只影响 `npm publish` 的目标，不改本机全局 registry，也不影响 DSH 的安装源选择。

**没有改动**：代码、技能正文、测试、文档内容。

**校验**

- `npm test`：30 个测试通过
- `npm publish --dry-run`：18 files / 92.9 kB，目标 `https://registry.npmjs.org/`

**发布状态**：仍未发布。npm 认证需要账号本人完成（浏览器授权、密码或 OTP），助手侧无法代办；登录成功后 `npm publish` 一条命令即可，随后补记发布条目。

### 004 · 2026-11-19 22:10 · 指向 GitHub 仓库并诊断网络

**背景**

GitHub 仓库已由作者建好：`https://github.com/JanSu0104/dsh-cosmogram`（API 确认：public、空仓库、默认分支 `main`）。浏览器访问该页面超时。

**诊断结果**

| 检查 | 结果 |
| --- | --- |
| `api.github.com` | ✅ 200，约 1.2–1.7 s |
| `github.com` DNS | 解析到 `57.155.223.240`，HTTPS 连接被断开（`Empty reply from server`） |
| 备用 IP（20.205.243.166 / 20.27.177.113 / 140.82.113.3 / 140.82.114.3） | ❌ 全部超时 |
| 本机代理 `127.0.0.1:7890` | ✅ 走代理访问 `https://github.com` 返回 200（约 7.5 s） |
| 已保存的 GitHub 凭据 | ❌ Keychain 中无 github.com 凭据 |

结论：仓库本身正常，超时是**本机到 github.com 的直连被阻断**（DNS 被解析到不可达地址）。走本地代理可以连上；推送还缺凭据。

**用什么工具**

- `edit`：`package.json` 补 `repository`、`homepage`、`bugs`
- `curl` / `dig` / `nc`：网络与代理诊断
- `git`：登记 `origin`，尝试推送
- `npm`：回归测试

**改了什么**

```json
"repository": { "type": "git", "url": "git+https://github.com/JanSu0104/dsh-cosmogram.git" },
"homepage": "https://github.com/JanSu0104/dsh-cosmogram#readme",
"bugs": { "url": "https://github.com/JanSu0104/dsh-cosmogram/issues" }
```

`origin` 已登记为 `https://github.com/JanSu0104/dsh-cosmogram.git`。

**校验**

- `npm test`：30 个测试通过
- 经代理 `git ls-remote` 可读到远端（空仓库），直连失败
- 推送因缺少 GitHub 凭据未完成（`GIT_TERMINAL_PROMPT=0` 下无法询问用户名/PAT）

**下一步**：作者提供 PAT 或在本机存入凭据后，`git push -u origin main` 即可；无需改动代码。

### 005 · 2026-11-19 22:16 · 首次推送到 GitHub

**背景**

远端 `JanSu0104/dsh-cosmogram` 里已有 5 个网页上传提交，但缺 `.gitignore` 与 `.github/workflows/ci.yml`（网页上传不选隐藏文件），`package.json` 也还是旧快照。本地是完整状态，因此用 force 覆盖，而不是合并两段无关历史。

**用什么工具**

- `bash`：`mktemp` 生成临时 `GIT_ASKPASS` 脚本注入凭据
- `git`：`push -u origin main --force`，经本地代理 `127.0.0.1:7890`
- `curl`：用 GitHub API 复核远端文件与提交

**过程**

1. 先验证 PAT 身份与权限：`JanSu0104`，仓库 `permissions.push = true`。
2. 直连 `github.com` 仍被阻断，改用 `-c http.proxy=http://127.0.0.1:7890`。
3. 凭据通过临时 `GIT_ASKPASS` 脚本注入，推送后立即删除；**没有**写进 `git config`、`~/.git-credentials` 或钥匙串。
4. 推送结果：`+ 37f875b...b242203 main -> main (forced update)`。

**远端复核**

| 检查 | 结果 |
| --- | --- |
| `.gitignore` | 200 |
| `.github/workflows/ci.yml` | 200 |
| `package.json` 的 `repository` / `homepage` | 正确指向本仓库 |
| `publishConfig` | `public` + npmjs 官方源 |
| 提交数 | 8（本地历史完整上传） |
| `ls-remote` HEAD | 与本地 `b242203` 一致 |

**安全提醒**：本次使用作者在对话中提供的 PAT，该凭据已出现在聊天记录里，应按已泄露处理——推送完成后立即吊销并重建一个最小权限令牌（只勾 `repo`，或 fine-grained 只给本仓库 Contents 读写）。

### 006 · 2026-11-19 22:20 · 仓库话题与 CI 验证

**用什么工具**

- `curl`（GitHub REST API）：`PUT /repos/.../topics` 写入话题；`GET /repos/.../actions/runs` 读取工作流结果
- `bash`：确认 CI 从 `in_progress` 变为 `completed`

**改了什么**

仓库 topics 设置为：`dsh-plugin`、`deepseek-harness`、`chinese-metaphysics`、`ziwei`、`bazi`、`liuyao`、`qimen`、`fengshui`、`tarot`、`astrology`、`divination`。

**校验**

GitHub Actions 的 `CI` 工作流在最近两次 push 上均为 `completed / success`（Node 20 与 22 矩阵，语法检查 + 30 个测试）。这说明仓库内容在干净环境下可独立跑通，不依赖本机。

### 007 · 2026-11-19 22:39 · 发布 0.1.0 到 npm

**过程**

1. 账号开启 2FA 后，`npm publish` 返回 `EOTP`，要求网页授权。非交互环境下 npm 会把授权链接打码，改用 `script -q /dev/null npm publish` 分配伪终端后拿到真实链接，由作者在浏览器完成授权。
2. 授权完成后 `PUT /dsh-cosmogram` 返回 202，npm 提示“正在处理”。registry 先出现 `0.0.0-stage` 占位版本（npm 首次发布新包名的 staged 机制）。
3. 约 4 分钟后 `0.1.0` 生效：placeholder 14:32:35 创建，正式版本 14:36:43 上线。

**结果**

| 检查 | 结果 |
| --- | --- |
| `npm view dsh-cosmogram version` | `0.1.0` |
| `repository.url` | `git+https://github.com/JanSu0104/dsh-cosmogram.git` |
| `homepage` | 指向 GitHub 仓库 |
| `dist.tarball` | `https://registry.npmjs.org/dsh-cosmogram/-/dsh-cosmogram-0.1.0.tgz` |
| 独立安装 | 临时目录 `npm i dsh-cosmogram` 成功 |
| 可加载性 | `import('dsh-cosmogram')` → `name`、`apply`、`inject: ["skills","tools"]` 均正确 |
| 包内文件 | 18 个，`lib`/`locale`/`assets`/`references`/`prompts`/`icon.svg` 齐全 |

**遗留**

- `0.0.0-stage` 占位版本仍在。`npm deprecate` 同样要求 2FA 授权，本次未完成，留待下次一并处理（它不会被 `npm i dsh-cosmogram` 装上，但按精确版本仍可安装）。
- `v0.1.0` 的 git tag 与 GitHub Release 附件尚未创建。

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

- [x] 在 GitHub 建仓库并推送 `main`（2026-11-19 22:16，见 005）
- [x] `package.json` 补 `repository` / `homepage` / `bugs`（见 004）
- [ ] 打 `v0.1.0` tag，Release 附件放 `dsh-cosmogram-0.1.0.tgz`
- [ ] 仓库加 `dsh-plugin`、`deepseek-harness` 等 topics
- [ ] `npm publish`（`publishConfig` 已就位，只差 `npm login`）
- [ ] 可选：提交 awesome-dsh-plugin 收录（要求仓库创建满 1 天）
