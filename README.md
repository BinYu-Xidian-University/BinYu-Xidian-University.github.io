# 于斌 · Bin Yu — 个人学术主页

西安电子科技大学计算机科学与技术学院 于斌 副教授的个人学术主页，
用于 GitHub Pages 部署（`https://<用户名>.github.io/`）。

纯静态站点：无框架、无构建步骤，只需把文件放进仓库根目录即可访问。

## 目录结构

```
.
├── index.html          # 全部内容（单页）
├── assets/
│   ├── style.css       # 样式（配色、排版、响应式、打印样式）
│   ├── main.js         # 滚动渐显、阅读进度、导航高亮、论文筛选
│   ├── avatar.png      # 个人照片
│   └── favicon.svg     # 站点图标
├── .nojekyll           # 关闭 Jekyll 处理，保证静态资源直接生效
└── deploy.sh           # 一键部署脚本
```

## 本地预览

```bash
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 部署到 GitHub Pages

### 方式一：脚本一键部署（推荐）

```bash
GITHUB_USER=你的用户名 GITHUB_TOKEN=你的token ./deploy.sh
```

脚本会：创建 `<用户名>.github.io` 仓库（若不存在）→ 推送代码 → 开启 Pages。
首次生效约需 1–2 分钟，之后访问 `https://<用户名>.github.io/`。

> Token 需要 `repo` 权限（fine-grained token 勾选 **Contents: Read and write** 与
> **Pages: Read and write**）。建议用完即删，脚本不会把 token 写入 git 配置。

### 方式二：手动部署

1. GitHub 新建仓库，仓库名必须是 `<用户名>.github.io`（公开）。
2. 在仓库 **Settings → Pages** 中，Source 选择 `Deploy from a branch`，
   Branch 选 `main`、目录 `/ (root)`，保存。
3. 推送本目录内容：

```bash
git remote add origin https://github.com/<用户名>/<用户名>.github.io.git
git branch -M main
git push -u origin main
```

## 日常更新

- **改文字**：直接编辑 `index.html`，各区块有中文注释分隔（HERO / ABOUT / NEWS / PUBLICATIONS …）。
- **换照片**：替换 `assets/avatar.png`（建议正方形，边长 ≥ 600px）。
- **加论文**：复制一条 `<li class="pub" data-cat="conf ccfa">…</li>`。
  `data-cat` 取值：`conf`（会议）/ `journal`（期刊）/ `ccfa`（CCF-A）/ `cn`（中文期刊、学位论文），可多值，用于筛选按钮。
  被引次数用 `<span class="cites">被引 9</span>` 附在 venue 行末。
- **加动态**：复制一条 `<li class="reveal">…</li>`，日期用 `yyy.yymm` 格式；
  需要强调的条目加 `tl-highlight` 类。

## 设计与技术说明

- 配色：暖白纸感底色 `#f8f7f4` + 深靛蓝 `#0d3b66` + 铜色强调 `#a8622f`（约 60-30-10 配比）。
- 字体：系统无衬线中文（苹方 / 微软雅黑）+ 衬线斜体英文名，零外部字体请求，国内外访问都不卡。
- 响应式断点：900px（双栏转单栏）、640px（移动端单列）。
- 无障碍：`prefers-reduced-motion` 关闭动效、`<noscript>` 兜底显示、语义化标签与 aria 标签。
