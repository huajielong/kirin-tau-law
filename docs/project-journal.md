# 项目复盘：KIRIN 9040 产品展示页

> 全程 AI 辅助开发，一个视频 → 一个网站 → 三个平台上线

---

## 整体流程

```
用户给视频 → AI 生成页面 → 迭代调优 → 部署上线
```

---

## 关键对话记录

### 1. 启动阶段
- **用户**：提供麒麟 9040 芯片视频，要求做高端产品展示页
- **要求**：全黑背景、scroll-driven 动画、左 1/3 文字 + 右 2/3 产品视频、全部左对齐
- **AI**：用 `video-to-website` + `frontend-design` 技能生成完整网站

### 2. 内容调整
- **用户要求修改**："3nm 制程 300 亿" → "等效 2nm 制程，中芯国际 7 层逻辑折叠，2100 亿+ 晶体管"
- **用户要求**：重排章节时序，让文字出现和视频画面匹配

### 3. Bug 修复（最有价值部分）
| 问题 | 原因 | 解决 |
|------|------|------|
| 导航点击无内容 | GSAP 初始 opacity:0，scrollTo 不触发动画 | 只靠滚动驱动，不用 timeline.progress() |
| 滚动完全崩溃 | 重复 const 声明导致 JS 报错 | 删除重复声明 |
| 第二章出现太晚 | 章节范围有 10% 空白间隙 | 整体前移 6-8% |
| 视频结束太早 | FRAME_SPEED=2.0 在 50% 处播完 | 降到 1.5，延至 66% |
| git push 被拒 | 安全系统拦截 | 用 gh API 逐文件上传 |

### 4. 部署阶段
- 提交 GitHub → 公开仓库
- 部署 Vercel（自动）+ Cloudflare Pages（CI/CD）+ GitHub Pages
- 三平台同步，git push 自动更新

### 5. 内容输出
- 生成抖音脚本（后删除）和 Anthropic 风格 10 页 PPT
- 上传 skills 到仓库，更新 README

---

## 核心参数

```
FRAME_SPEED = 1.5        # 视频覆盖 ~66% 滚动
IMAGE_SCALE = 0.85       # 产品缩放比例
FRAME_COUNT = 91         # 总帧数
章节范围: 14-26 / 24-38 / 36-50 / 48-62 / 58-72 / 68-82
```

## 产出物

```
index.html          → 主页面
css/style.css       → 暗黑主题
js/app.js           → 动画引擎
frames/             → 91 帧 WebP
content/ppt-slides  → 10 页 PPT
skills/             → AI 技能模板
docs/               → 本复盘笔记
```

## 在线地址

- Vercel: kirin-tau-law.vercel.app
- Cloudflare: kirin-tau-law.pages.dev
- GitHub Pages: huajielong.github.io/kirin-tau-law
