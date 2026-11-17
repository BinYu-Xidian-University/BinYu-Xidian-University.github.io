#!/usr/bin/env bash
# ------------------------------------------------------------
# 一键部署到 GitHub Pages
# 用法：
#   GITHUB_USER=你的用户名 GITHUB_TOKEN=ghp_xxx ./deploy.sh
# ------------------------------------------------------------
set -euo pipefail

: "${GITHUB_USER:?请设置 GITHUB_USER（你的 GitHub 用户名）}"
: "${GITHUB_TOKEN:?请设置 GITHUB_TOKEN（需 repo / Contents+Pages 写权限）}"

REPO="${GITHUB_USER}.github.io"
API="https://api.github.com"
AUTH=(-H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json")

echo "==> 目标仓库：${GITHUB_USER}/${REPO}"

# 1. 仓库不存在则创建
code=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "${API}/repos/${GITHUB_USER}/${REPO}")
if [ "$code" = "200" ]; then
  echo "==> 仓库已存在，跳过创建"
elif [ "$code" = "404" ]; then
  echo "==> 创建仓库 ${REPO}"
  curl -s -X POST "${AUTH[@]}" "${API}/user/repos" \
    -d "{\"name\":\"${REPO}\",\"private\":false,\"description\":\"Personal academic homepage of Bin Yu (Xidian University)\"}" \
    > /dev/null
else
  echo "!! 查询仓库失败（HTTP ${code}），请检查 token 权限" >&2
  exit 1
fi

# 2. 初始化 git 并提交
if [ ! -d .git ]; then
  git init -q
fi
git branch -M main
git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "Deploy personal academic homepage"
fi

# 3. 推送（token 只用于本次 push，不写入 .git/config）
echo "==> 推送代码"
git push -q --force "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO}.git" main
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${GITHUB_USER}/${REPO}.git"

# 4. 开启 Pages（已开启则更新源）
echo "==> 开启 GitHub Pages"
pages_code=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "${API}/repos/${GITHUB_USER}/${REPO}/pages")
body='{"source":{"branch":"main","path":"/"}}'
if [ "$pages_code" = "404" ]; then
  curl -s -X POST "${AUTH[@]}" "${API}/repos/${GITHUB_USER}/${REPO}/pages" -d "$body" > /dev/null || true
else
  curl -s -X PUT "${AUTH[@]}" "${API}/repos/${GITHUB_USER}/${REPO}/pages" -d "$body" > /dev/null || true
fi

echo ""
echo "✅ 完成。首次生效约 1–2 分钟，之后访问：https://${REPO}/"
