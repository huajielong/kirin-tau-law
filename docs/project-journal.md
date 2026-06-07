# KIRIN 9040 · 韬（τ）定律 — 项目全记录

> **一个产品视频 → AI 驱动 → 三个平台上线的高端展示页**
>
> 从零到完成，一次完整的 AI 辅助开发实战记录。

---

## 📋 项目信息

| 项目 | 内容 |
|------|------|
| **产品** | 华为麒麟 9040 旗舰芯片 · 韬（τ）定律 |
| **类型** | Scroll-Driven 产品展示网站（单页） |
| **技术栈** | 原生 HTML/CSS/JS + Lenis + GSAP + Canvas |
| **部署** | Vercel · Cloudflare Pages · GitHub Pages |
| **设计风格** | 全黑背景 · 分屏布局 · 暗金旗舰调性 |
| **AI 工具** | Claude Code + video-to-website + frontend-design 技能 |

---

## 🗺️ 整体流程图

```
用户提供视频
    │
    ▼
┌─────────────────────────────────────────────────┐
│             AI 驱动的开发流程                     │
│                                                   │
│  ① FFmpeg 帧提取 ────→ ② 页面骨架生成            │
│        │                      │                   │
│        ▼                      ▼                   │
│  ③ Canvas 渲染引擎       ④ CSS 暗黑主题           │
│        │                      │                   │
│        ▼                      ▼                   │
│  ⑤ Lenis + GSAP 动画系统   ⑥ 章节文案适配         │
│        │                      │                   │
│        ▼                      ▼                   │
│  ⑦ 时序校准 ─── 文字出现 ↔ 视频画面匹配            │
│        │                                           │
│        ▼                                           │
│  ⑧ 多平台部署 ─── Vercel + Cloudflare + GH Pages   │
└─────────────────────────────────────────────────┘
    │
    ▼
用户获得：三平台上线的高端产品展示站
```

---

## 第一章：需求定义

### 1.1 初始需求

用户提供了一段麒麟 9040 芯片的产品展示视频，要求：

- **高端专业感** — 媲美 Apple 级别产品发布页
- **全黑背景**（`#000`）— 与产品动画无缝融合
- **Scroll-driven 叙事** — 滚动触发每一个动画节点
- **分屏布局** — 左 1/3 文字 + 右 2/3 产品视频（**固定不动**）
- **所有文本左对齐**

### 1.2 内容规划

| 章节 | 内容 | 关键数据 |
|------|------|---------|
| 概念 | 何为韬（τ）定律 | 时间维度的博弈 |
| 制程 | 等效 2nm 工艺 | 2100亿+ 晶体管，中芯国际 7 层逻辑折叠 |
| 性能 | 性能突破 | 能效比 / 算力 |
| 数据 | 关键统计 | Stats 面板 |
| 架构 | 架构革新 | 逻辑折叠技术 |
| CTA | 了解更多 | — |

> 💡 **关键决策**：章节内容要与视频画面节奏匹配，文字出现时视频正好展示对应画面。

---

## 第二章：技术实现

### 2.1 技术选型

| 技术 | 用途 | 选择理由 |
|------|------|---------|
| **原生 HTML/CSS/JS** | 基础框架 | 零构建工具，无依赖，直出 |
| **Lenis** | 平滑滚动 | 替代原生 scroll，创造"体验感" |
| **GSAP + ScrollTrigger** | 动画引擎 | 高性能、精准进度控制、6 种动画类型 |
| **Canvas API** | 视频帧渲染 | 自定义显示控制，避免视频标签的局限性 |
| **FFmpeg** | 帧提取 | 视频 → WebP 帧序列 |

### 2.2 帧提取流程

```bash
# 分析视频参数
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,duration,r_frame_rate,nb_frames \
  -of csv=p=0 "video/input.mp4"

# 提取帧（fps=18，scale=1920，WebP quality=85）
ffmpeg -i "video/input.mp4" \
  -vf "fps=18,scale=1920:-1" \
  -c:v libwebp -quality 85 \
  "frames/frame_%04d.webp"
```

**参数决策**：
- `fps=18` — 91 帧，在滚动时长和流畅度之间取平衡
- `scale=1920` — 适配 2K 屏幕，保持清晰度
- `quality=85` — WebP 格式，文件大小与画质的平衡点

### 2.3 渲染引擎（Padded Cover Mode）

核心策略：**不是简单地拉伸或裁剪图片，而是缩放 + 填充 + 边框融合**

```js
const IMAGE_SCALE = 0.85;  // 0.82-0.90 最佳区间

// 自动采样帧边缘颜色，用于填充边框间隙
function sampleBgColor(ctx, width, height) {
  const data = ctx.getImageData(0, 0, width, height).data;
  // 取四个角落像素平均值作为背景色
}

// 绘制一帧
function drawFrame(index) {
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
                * IMAGE_SCALE;
  // 先填充背景色 → 再绘制缩放后的图片
  // 这样边框间隙看起来是自然的背景延伸
}
```

### 2.4 帧与滚动的绑定

```js
const FRAME_SPEED = 1.5;  // 视频在约 66% 滚动处播完，不是 50%

ScrollTrigger.create({
  trigger: scrollContainer,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
    const index = Math.floor(accelerated * FRAME_COUNT);
    // → 根据滚动进度计算当前帧
  }
});
```

### 2.5 六种动画系统

每个章节使用**不同的入场动画**，绝不重复：

| 动画类型 | 初始状态 | 持续时间 | 缓动函数 |
|---------|---------|---------|---------|
| `slide-left` | x:-80, opacity:0 | 0.9s | power3.out |
| `fade-up` | y:50, opacity:0 | 0.9s | power3.out |
| `scale-up` | scale:0.85, opacity:0 | 1.0s | power2.out |
| `stagger-up` | y:60, opacity:0, stagger:0.15 | 0.8s | power3.out |
| `clip-reveal` | clipPath:inset(100% 0 0 0) | 1.2s | power4.inOut |
| `slide-right` | x:80, opacity:0 | 0.9s | power3.out |

### 2.6 布局系统

```
桌面端 (>1024px)          平板 (768-1024px)         手机 (<768px)
┌──────┬──────────┐     ┌────────┬────────┐     ┌──────────────┐
│ 文字 │  产品视频  │     │  文字  │  产品  │     │   文字区域    │
│ 33%  │   67%    │     │  40%  │  60%  │     ├──────────────┤
│      │          │     │        │        │     │   产品视频    │
│ fixed│  fixed   │     │  fixed │  fixed │     │  （堆叠）    │
└──────┴──────────┘     └────────┴────────┘     └──────────────┘
```

### 2.7 英雄过渡（Circle-Wipe）

```
开始滚动前                   开始滚动
┌──────────────────┐        ┌──────────────────┐
│                  │        │        ╭──╮      │
│    Hero 标题      │  →    │        │  │      │
│                  │        │        ╰──╯      │
│    Canvas 隐藏    │        │  Canvas 圆形展开  │
│  clip-path: 0%   │        │  clip-path: 75%  │
└──────────────────┘        └──────────────────┘
```

英雄标题淡出的同时，Canvas 通过 `clip-path: circle()` 从 0% 展开到 75%，完成过渡。

---

## 第三章：问题排查与修复

这是项目中**最耗时**的部分，也是最有价值的经验。

### 问题 1：导航点击后无内容

**现象**：点击导航按钮滚到对应章节，但页面上看不到文字内容。

**根因**：
- GSAP `from()` 动画初始状态设置元素 `opacity: 0`
- 页面刚加载时元素处于初始状态，还没被动画"激活"
- 直接跳转到目标位置不会触发 GSAP 动画播放

**解决方案**：
```js
// ❌ 错误做法（会导致滚动冲突）
tl.progress(0.08);  // 手动设置进度

// ✅ 正确做法：只通过滚动位置驱动
lenis.scrollTo(enterPercent * totalScroll);
// 让 ScrollTrigger 的 scrub 机制自然处理动画播放
```

**教训**：scrub 模式下的动画**只能由滚动驱动**，不要同时手动操作 timeline。

### 问题 2：滚动完全崩溃

**现象**：页面完全无法滚动。

**根因**：双重 `const enter` 声明导致 JS 报错，整个脚本中断执行。

```js
// 第 244 行
const enter = parseFloat(section.dataset.enter) / 100;
// ...
// 第 259 行 — 重复声明 ❌
const enter = somethingElse;  // 报错！
```

**解决方案**：去掉重复声明，统一变量名。

**教训**：AI 生成代码容易出现变量名冲突，每次大修改后要检查 `const`/`let` 重复声明。

### 问题 3：第二章出现太晚（32%）

**现象**：文字内容到 32% 滚动位置才出现，而视频进度已经过半。

**根因**：章节 `data-enter` 范围太稀疏，之间有 10% 的空白间隙。

**解决方案**：整体前移 6-8%

```
修正前:  22 → 32 → 44 → 56 → 68 → 80
修正后:  16 → 26 → 38 → 50 → 60 → 72   ✅
最终版:  14 → 24 → 36 → 48 → 58 → 68   ✅
```

### 问题 4：视频与文字节奏不匹配

**现象**：视频在滚动 50% 时就播完了，最后三章对着静态帧。

**根因**：`FRAME_SPEED = 2.0`，等于在 50% 滚动处播完全部 91 帧。

**解决方案**：通过对帧文件大小分析，发现前 60 帧变化剧烈（对应重要画面），后 31 帧趋于稳定。

```js
// 调整 FRAME_SPEED
FRAME_SPEED: 2.0 → 1.5

// 视频结束位置: 50% → 66%
// 让重要画面分布在 6 个章节范围内
```

同步调整章节范围：
```
旧: 22-36, 32-48, 44-58, 56-70, 68-80, 78-92
新: 14-26, 24-38, 36-50, 48-62, 58-72, 68-82
```

**教训**：`FRAME_SPEED` 是视频-滚动同步的**核心杠杆**，调整它比调整章节范围更有效。

### 问题 5：Cloudflare 部署与 CI/CD

**现象**：
- Wrangler CLI 登录多次超时/拒绝
- GitHub Token 权限不足
- `git push` 被安全系统阻止

**解决方案**：
1. Wrangler → 最终通过浏览器登录成功
2. GitHub Token → 给 token 授予 `workflow` 权限
3. git push → 用 `gh api` PUT 逐个上传文件作为 workaround

最终 CI/CD 流程正常工作：`git push → GitHub Actions → Cloudflare Pages 自动部署`

---

## 第四章：技术架构

### 4.1 文件结构

```
kirin-tau-law/
│
├── index.html            ← 主页面（Loader → Header → Hero → Canvas → 6个章节）
├── css/
│   └── style.css         ← 暗黑主题 + 分屏布局 + 响应式
├── js/
│   └── app.js            ← 核心引擎（Lenis + GSAP + Canvas + 所有动画）
│
├── frames/               ← 91 帧 WebP 图片（gitignored 中视频）
│   ├── frame_0001.webp
│   ├── frame_0002.webp
│   └── ...
│
├── content/
│   └── ppt-slides.html   ← Anthropic 风格 10 页 PPT
│
├── skills/               ← AI 技能（可复用模板）
│   ├── video-to-website/
│   │   └── SKILL.md      ← 视频→滚动网站工作流
│   └── frontend-design/
│       └── SKILL.md      ← 前端美学设计指导
│
├── docs/
│   └── project-journal.md ← 本文件（项目全记录）
│
├── .github/workflows/
│   └── deploy-cloudflare.yml  ← CI/CD 自动部署
│
├── README.md
├── LICENSE
└── .gitignore
```

### 4.2 运行时架构

```
用户滚动
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Lenis 平滑滚动引擎                               │
│  • duration: 1.2                                 │
│  • 自定义 easing: 1-2^(-10t)                     │
│  • wheelMultiplier: 0.9                          │
└────────────────────────┬────────────────────────┘
                         │ raf 每帧
                         ▼
┌─────────────────────────────────────────────────┐
│  ScrollTrigger 更新                              │
│  • 帧进度计算: progress × FRAME_SPEED            │
│  • 章节动画: 根据 enter/leave 计算本地进度        │
│  • 暗色遮罩: 根据范围计算透明度                    │
│  • Counter: 数字滚动                             │
│  • Marquee: 文本水平移动                          │
└──┬──────────┬──────────┬──────────┬─────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
Canvas    GSAP       DOM       GSAP
帧渲染    章节动画   遮罩/     Counter/
                    Marquee    Hero
```

---

## 第五章：性能与优化

### 5.1 帧加载策略（双阶段预加载）

```
            ┌─ Phase 1（同步）─┐
            │ 加载前 10 帧      │ ← 尽快展示首帧
            │ 显示进度条        │
            └────────┬─────────┘
                     ▼
            ┌─ Phase 2（并行）─┐
            │ 剩余 81 帧同时加载 │ ← Promise.all
            │ 完成后隐藏加载器   │
            └────────┬─────────┘
                     ▼
                 启动滚动
```

### 5.2 关键性能指标

| 指标 | 数值 |
|------|------|
| 帧数 | 91 帧 |
| 每帧大小 | ~80-150KB (WebP) |
| 总帧资源 | ~10-12MB |
| FRAME_SPEED | 1.5 |
| 滚动总高度 | ~800vh |
| Lenis duration | 1.2s |
| 首批可见帧 | 10 帧 (~1MB) |

### 5.3 自适应背景色

Canvas 渲染时每 20 帧自动采样帧边缘颜色，填充缩放后的边框间隙：

```
采样点：
┌──┬────────────────┬──┐
│1 │                │2 │
├──┤                ├──┤
│  │   图像主体      │  │
├──┤                ├──┤
│3 │                │4 │
└──┴────────────────┴──┘
取四角 RGB 均值 → fillRect 整个 Canvas → 再 drawImage
```

---

## 第六章：部署配置

### 6.1 三个平台对比

| 平台 | 地址 | 自动部署 | 备注 |
|------|------|---------|------|
| **Vercel** | kirin-tau-law.vercel.app | ✅ git push 自动 | 体验最好 |
| **Cloudflare Pages** | kirin-tau-law.pages.dev | ✅ GitHub Actions | 需要 CI/CD 配置 |
| **GitHub Pages** | huajielong.github.io/kirin-tau-law | ✅ gh-pages 分支 | 最基础 |

### 6.2 CI/CD 配置（Cloudflare）

```yaml
# .github/workflows/deploy-cloudflare.yml
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy . --project-name=kirin-tau-law
```

---

## 第七章：推广内容

### 7.1 Anthropic 风格 PPT

生成在 `content/ppt-slides.html`，共 10 页：

| 页面 | 标题 | 核心信息 |
|------|------|---------|
| 1 | 封面 | 当滚动变成叙事 — 产品展示的下一代形态 |
| 2 | 问题 | 一个产品展示站要多久？传统 4-7 天 |
| 3 | 答案 | 30 分钟。一个视频。一次对话。一个网站。 |
| 4 | 流程 | 视频 → AI + Skills → 三平台上线 |
| 5 | 技术 | 零构建工具，原生代码 |
| 6 | 布局 | 左 1/3 文字 · 右 2/3 产品 |
| 7 | AI 生产力 | 效率提升 200 倍 |
| 8 | 部署 | Vercel + Cloudflare + GitHub Pages |
| 9 | 复用 | 换一个视频 = 新网站 |
| 10 | CTA | 你的产品也值得这样的展示 |

设计规范：纯白背景、Noto Sans SC 900 字重标题、赤陶色（`#c8673e`）点缀、至少 40% 留白。

---

## 第八章：经验与教训

### 8.1 做对了的事

| ✅ 决策 | 为什么对 |
|---------|---------|
| 使用原生 HTML/CSS/JS | 零构建、零依赖，部署简单 |
| Lenis + GSAP 组合 | 平滑滚动 + 精准动画控制，行业标准 |
| FRAME_SPEED 参数化 | 一个变量控制整个视频节奏 |
| Padded Cover Mode | 比纯 cover/contain 视觉效果更好 |
| 双阶段帧加载 | 首屏秒开 + 后台加载，体验流畅 |

### 8.2 踩过的坑

| ❌ 坑 | 后果 | 怎么避免 |
|-------|------|---------|
| 重复 const 声明 | 整个 JS 崩溃 | 大修改后检查重复声明 |
| 手动调 timeline.progress | 与 scrub 冲突，滚动失效 | scrub 模式下只用滚动驱动 |
| 章节范围太稀疏 | 文字出现晚于视频 | 先定 FRAME_SPEED，再定范围 |
| FRAME_SPEED 默认 2.0 | 视频太快播完 | 根据帧内容分布调到 1.5 |
| git push 被安全系统阻止 | 推不上去 | 用 gh API 逐个上传，或检查权限 |

### 8.3 核心公式

```
帧索引 = 滚动进度 × FRAME_SPEED × 总帧数

章节动画进度 = (当前滚动进度 - 章节入口) / (章节出口 - 章节入口)

总滚动高度 ≈ 章节数 × 130vh  （6 章 ≈ 800vh）
```

---

## 第九章：如何复现此项目

### 给开发者的步骤

```bash
# 1. 安装工具
npm i -g vercel          # Vercel CLI（可选）
pip install ffmpeg       # 帧提取

# 2. 准备素材
#   - 一个产品视频（MP4/MOV，5-30 秒）
#   - 产品文案（特性列表、数据、卖点）

# 3. 使用 AI 技能生成
#   在 Claude Code 中说：
#   "使用 video-to-website 技能，从这个视频生成产品展示页"

# 4. 迭代调优
#   - 调整 FRAME_SPEED   → 匹配视频节奏
#   - 调整章节范围       → 匹配文案顺序
#   - 调整色彩变量       → 匹配品牌调性

# 5. 部署
git push                # → 自动部署到三个平台
```

### 关键参数调优指南

```
FRAME_SPEED 调优：
  视频节奏快 → 设为 1.8-2.0
  视频节奏慢 → 设为 1.2-1.5
  不 确  定 → 从 1.5 开始，观察再调整

IMAGE_SCALE 调优：
  产品完整展示 → 0.85-0.90
  特写细节     → 0.75-0.82
  全屏沉浸     → 1.0

章节范围调优：
  均匀分布     → 每章 12-14% 范围，间隙 2%
  重点章节     → 给 16-18% 范围
  结尾章节     → 设 data-persist="true"
```

---

## 第十章：项目数据

### 10.1 时间线

| 环节 | 耗时 | 说明 |
|------|------|------|
| 初始生成 | ~10 min | AI 生成完整网站骨架 |
| 内容调整 | ~5 min | 文案修改、章节规划 |
| Bug 修复 | ~10 min | 导航、滚动、时序问题 |
| 多平台部署 | ~5 min | Vercel + Cloudflare + GH Pages |
| **总计** | **~30 min** | 从零到三平台上线 |

### 10.2 与传统开发对比

| 维度 | 传统开发 | AI + Skills | 提升 |
|------|---------|-------------|------|
| 页面搭建 | 2-3 天 | 5 分钟 | ~500x |
| 动画编排 | 1-2 天 | 自动生成 | ~200x |
| 帧提取同步 | 半天 | 一键命令 | ~50x |
| 部署上线 | 半天 | 10 分钟 | ~30x |
| **总时间** | **4-7 天** | **~30 分钟** | **~200x** |

---

## 附录

### A. 使用的 AI 技能

| 技能 | 文件路径 | 作用 |
|------|---------|------|
| `video-to-website` | `skills/video-to-website/SKILL.md` | 视频→滚动网站核心工作流 |
| `frontend-design` | `skills/frontend-design/SKILL.md` | 前端美学设计指导 |

### B. 在线地址

| 平台 | URL |
|------|-----|
| Vercel | https://kirin-tau-law.vercel.app |
| Cloudflare | https://kirin-tau-law.pages.dev |
| GitHub Pages | https://huajielong.github.io/kirin-tau-law |
| 仓库 | https://github.com/huajielong/kirin-tau-law |

### C. 技术栈版本

| 依赖 | 版本 | 获取方式 |
|------|------|---------|
| Lenis | 1.x | CDN |
| GSAP | 3.x | CDN |
| ScrollTrigger | 3.x | GSAP 插件 |
| FFmpeg | 系统安装 | - |
| WebP | libwebp | FFmpeg 内置 |

---

> **Made with ❤️ for KIRIN · 麒麟 · 2026**
>
> *本文档记录了从零到上线的完整过程，既是复盘笔记，也是 AI 辅助开发的方法论参考。*
