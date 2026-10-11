# rural_demo 小程序设计规范（落地版）

> 依据《小程序 UI 界面基础设计规范》落地到本项目。
> **所有页面必须使用本规范的 token，不允许硬编码字号/尺寸。**
> 设计系统唯一真源：`miniprogram/app.wxss`

---

## 1. 尺寸规范

| 项目 | 规范值 | rpx | 说明 |
|---|---|---|---|
| 设计稿 | 375 × 812 pt | 750rpx 宽 | 1 倍图 |
| 页边距 | **16pt** | **32rpx** | `--sp-page`，所有页面统一 |
| 状态栏 | 47pt | — | 系统绘制，自定义导航时需自行留白 |
| 导航栏 | 44pt | — | 系统绘制（本项目默认用原生导航栏） |
| 底部一级导航 | 49/50pt | — | 系统 tabBar |
| 底部图标 | 24pt | 48rpx | tabBar 图标尺寸 |
| 指示器 | 32pt | — | 系统 |

**换算关系**：`1pt = 2rpx`（375pt 设计稿 = 750rpx）。

> 目前 tabBar 是**纯文字无图标**。若要按规范补 24pt 图标，需要先确定图标资源来源（iconfont / PNG 图集），见第 8 节待办。

---

## 2. 字号体系（8 级，行高统一 1.5）

| 场景 | 规范 | 标准档 | 大档 | 特大档 | Token |
|---|---|---|---|---|---|
| 重点文字 | 24pt Bold | 48rpx | 56rpx | 64rpx | `--fs-title` / `--fs-24` |
| 大标题 | 18pt Bold | 36rpx | 42rpx | 48rpx | `--fs-xl` / `--fs-18` |
| 一级标题 | 16pt Bold | 32rpx | 38rpx | 44rpx | `--fs-lg` / `--fs-16` |
| 列表文字/标签 | 15pt Medium | 30rpx | 36rpx | 42rpx | `--fs-list` / `--fs-15` |
| 正文/按钮 | 14pt Regular | 28rpx | 34rpx | 40rpx | `--fs-base` / `--fs-14` |
| 辅助文字 | 13pt Regular | 26rpx | 32rpx | 36rpx | `--fs-sm` / `--fs-13` |
| 说明文字 | 12pt Regular | 24rpx | 30rpx | 34rpx | `--fs-xs` / `--fs-12` |
| 标签文字 | 10pt Regular | 20rpx | 24rpx | 28rpx | `--fs-tag` / `--fs-10` |

**字体族**：中文 PingFang SC，英文 SF Pro，回退到系统默认。已写在 `page` 样式里，无需重复设置。

**行高**：统一 `line-height: 1.5`（规范建议）。长文阅读（公告正文）用 1.7，这是适老化的有意放宽。

### 适老化三档机制

- **标准档 = 规范原值**，保证合规
- **大档 ≈ ×1.2**、**特大档 ≈ ×1.4**，供老人切换
- 实现方式：三档只改 CSS 变量，页面代码引用语义 token（`--fs-base`），**换档全站自动生效**
- 入口：「我的 → 字体大小」
- 首次进入会读取微信自带的 `fontSizeSetting` 自动匹配档位

> ⚠️ 写页面时**只准用语义 token**（`--fs-base`/`--fs-sm`…），绝不要写死 `font-size: 30rpx`，否则切字号时会漏掉。

---

## 3. 色彩

| 用途 | 变量 | 值 |
|---|---|---|
| 主色 | `--c-primary` | `#1F7A45` |
| 主色深（按下态） | `--c-primary-dark` | `#176035` |
| 主色浅底 | `--c-primary-light` | `#E9F5EE` |
| 提醒/紧急 | `--c-accent` | `#E8820C` |
| 危险/删除 | `--c-danger` | `#C7362F` |
| 信息/处理中 | `--c-info` | `#2563EB` |
| 待评价 | `--c-purple` | `#7C3AED` |
| 正文 | `--c-text` | `#1A1A1A` |
| 次要文字 | `--c-text-sub` | `#5A5A5A` |
| 弱化文字 | `--c-text-weak` | `#8A8A8A` |
| 边框 | `--c-border` | `#E4E7E4` |
| 页面底 | `--c-bg` | `#F3F6F3` |
| 卡片 | `--c-card` | `#FFFFFF` |
| 禁用 | `--c-disabled` | `#C9E3D3` |

**适老化约束**：正文对比度 ≥ 4.5:1，正文颜色不用 `--c-text-weak`（那是弱化文字，仅用于说明/时间）。

> ⚠️ 规范里的 **03 颜色页**没有拿到，当前配色是项目自定。如果颜色规范有明确色值，把页面发我，我按规范统一替换。

### 3.1 模块渐变色板（避免全站单一绿色）

每个功能模块分配一个色相，用于该模块的**头部曲线、图标底、状态色**，形成色彩导视：

| 模块 | 主题名 | 主渐变 | 曲线渐变 | 导航栏底色 |
|---|---|---|---|---|
| 首页 / 工单 | `green` | `--g-green` | `--g-curve-green` | `#CBE7D7` |
| 通知公告 | `orange` | `--g-orange` | `--g-curve-orange` | `#FADDB6` |
| AI 问答 | `purple` | `--g-purple` | `--g-curve-purple` | `#DED0F9` |
| 我的 | `blue` | `--g-blue` | `--g-curve-blue` | `#CDE0FA` |

**用法**：页面导航栏底色用该模块曲线渐变的**顶部色**，这样导航栏和曲线无缝衔接，整个头部是一块柔和的色块。

```json
{
  "navigationBarBackgroundColor": "#CBE7D7",
  "navigationBarTextStyle": "black"
}
```

> 导航栏文字统一用 `black`（底色是浅色，用白字会看不清）。

**其他渐变 token**：
- 按钮：`--g-green` / `--g-orange` / `--g-purple` / `--g-blue` / `--g-danger`
- 入口图标底：`--g-icon-green` / `--g-icon-orange` / `--g-icon-purple` / `--g-icon-blue` / `--g-icon-teal`
- 按下态：`--g-green-active`

### 3.2 阴影层级（层次感）

| Token | 用途 |
|---|---|
| `--shadow-sm` | 极轻浮起（小元素） |
| `--shadow-md` | 卡片默认 |
| `--shadow-lg` | 悬浮突出的元素 |
| `--shadow-float` | 白色悬浮卡片 |
| `--shadow-btn` | 主按钮投影 |

**投影颜色跟随主题色**，不要一律用黑色：绿色卡片用 `rgba(31,122,69,.2)`，橙色用 `rgba(232,130,12,.2)`。这样层次更自然。

---

## 3.3 页面头部范式（全站统一）

所有**一级页面**（首页 / 工单列表 / 通知 / AI / 我的 / 提交页 / 登录页）统一使用 `page-header` 组件：

```
┌─────────────────────────┐
│   柔和渐变曲线背景        │
│                         │
│        ┌─────┐          │  ← 白色圆角卡片，浮在曲线边界上
│        │ 🏡  │          │     投影跟随主题色
│        └─────┘          │
│    ╰───────╯ 曲线        │
│                         │
│      页面标题（居中）      │
│      副标题（居中）        │
└─────────────────────────┘
```

**用法**：

```xml
<page-header
  icon="📋"
  title="我的工单"
  subtitle="反映过的事，都在这儿"
  theme="green" />
```

| 属性 | 类型 | 说明 |
|---|---|---|
| `icon` | String | 图标（emoji） |
| `title` | String | 主标题，居中 |
| `subtitle` | String | 副标题，居中 |
| `theme` | String | `green` / `orange` / `purple` / `blue` |
| `customNav` | Boolean | 页面用了自定义导航栏时传 `true`（自动加状态栏高度） |
| `compact` | Boolean | 紧凑模式，聊天页等空间紧张时用 |
| `showCard` | Boolean | 是否显示悬浮卡片，默认 `true` |

**页面 json 必须注册**：

```json
{
  "usingComponents": {
    "page-header": "/components/page-header/page-header"
  }
}
```

**例外**：二级详情页（工单详情 / 通知详情）**不使用**头部范式——它们有原生导航栏 + 返回按钮，再加曲线头会重复且浪费空间。这类页面用**渐变状态横幅**（工单详情）或**渐变操作按钮**（通知详情）来承载模块色。

---

## 4. 按钮规范

### 4.1 三种尺寸

| 类型 | 规范高度 | 标准档 | Token |
|---|---|---|---|
| 主按钮 | 48–52px | **104rpx**（52pt） | `--btn-h` |
| 辅助按钮 | 40–44px | **88rpx**（44pt） | `--btn-h-sm` |
| 文字按钮 | 32–36px | **72rpx**（36pt） | `--btn-h-text` |

**点击热区 ≥ 44×44pt（88rpx）**：主/辅按钮已满足；文字按钮靠容器 `--hit-min` 撑开热区。

> 适老化说明：主按钮取规范上限 52pt（而非下限 48pt），大档 120rpx、特大档 136rpx。

### 4.2 五种状态

| 状态 | 类名 | 表现 |
|---|---|---|
| 默认 | `.btn-primary` | 实心主色 |
| 点击 | 自动（`:active`） | 加深为 `--c-primary-dark` |
| 禁用 | `.btn-disabled` 或 `disabled` 属性 | 淡绿底白字，降饱和 |
| 加载中 | 内嵌 `.spinner` | 转圈 + 文案改「正在提交…」 |
| 完成 | `.btn-done` | 主色底 + 对勾 |

### 4.3 用法示例

```xml
<!-- 主按钮 + 加载态 -->
<button class="btn btn-primary btn-block" bindtap="submit" disabled="{{submitting}}">
  <view class="spinner" wx:if="{{submitting}}"></view>
  <text>{{submitting ? '正在提交…' : '提交给村委会'}}</text>
</button>

<!-- 辅助按钮 -->
<button class="btn btn-secondary btn-block" bindtap="callVillage">打电话问村里</button>

<!-- 文字按钮 -->
<text class="btn-text" bindtap="goNotices">全部 ›</text>
```

---

## 5. 图标规范

规范统一尺寸：**16 / 20 / 24 / 32 / 48 / 64 pt**

| 类名 | 尺寸 | 典型用途 |
|---|---|---|
| `.icon-16` | 32rpx | 行内小图标 |
| `.icon-20` | 40rpx | 输入框前缀 |
| `.icon-24` | 48rpx | 列表项图标、tabBar |
| `.icon-32` | 64rpx | 状态图标 |
| `.icon-48` | 96rpx | 功能入口图标 |
| `.icon-64` | 128rpx | 空状态插图 |

**当前实现**：项目暂用 emoji 作图标（大、彩色、老人易识别），但**尺寸已统一收敛到规范栅格**，并随字号档位缩放。

> ⚠️ 待办：规范要求图标用统一栅格绘制（外框/中心线/圆形基准）。要真正落地需要引入图标资源。见第 8 节。

---

## 6. 间距与圆角

**间距按 8pt 栅格**：

| Token | 值 | pt |
|---|---|---|
| `--sp-1` | 8rpx | 4 |
| `--sp-2` | 16rpx | 8 |
| `--sp-3` | 24rpx | 12 |
| `--sp-4` | 32rpx | 16 |
| `--sp-5` | 40rpx | 20 |
| `--sp-6` | 48rpx | 24 |
| `--sp-page` | 32rpx | **16（规范页边距）** |

**圆角**：`--r-sm` 16rpx / `--r-md` 24rpx / `--r-lg` 32rpx / `--r-xl` 44rpx

---

## 7. 可直接复用的组件类

| 类名 | 用途 |
|---|---|
| `.page-body` | 页面内容容器（自动套用 16pt 页边距） |
| `.card` | 白底圆角卡片 |
| `.section-title` | 区块标题（一级标题 16pt） |
| `.list-item` / `.list-item-title` / `.list-item-desc` / `.list-item-foot` | 标准列表项 |
| `.entry-card` / `.entry-icon` / `.entry-title` / `.entry-desc` | 大卡片入口 |
| `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-text` | 按钮三件套 |
| `.call-bar` | 通栏电话按钮 |
| `.field` / `.field-label` / `.input` / `.textarea` | 表单 |
| `.tag` + `.tag-pending` / `.tag-processing` / `.tag-done` / `.tag-closed` | 状态标签 |
| `.tabs` / `.tab` / `.tab-active` | 筛选 tab |
| `.timeline` / `.tl-item` / `.tl-dot` / `.tl-action` | 时间轴 |
| `.stat-row` / `.stat-item` / `.stat-num` / `.stat-label` | 统计卡片 |
| `.bubble` / `.bubble-ai` / `.bubble-user` | 对话气泡 |
| `.voice-btn` / `.voice-wave` / `.voice-preview` | 语音组件 |
| `.empty` / `.empty-icon` / `.empty-text` | 空状态 |
| `.skeleton-card` / `.sk-line` | 骨架屏 |
| `.footer-bar` / `.footer-holder` | 底部固定操作条 |
| `.offline-bar` | 离线提示条 |
| `.setting-row` / `.size-picker` | 设置项 |

---

## 8. 开发约定（重要）

### 必须遵守

1. **不硬编码字号**：一律用 `var(--fs-*)`，否则适老化切档会漏
2. **不硬编码页边距**：用 `.page-body` 或 `var(--sp-page)`
3. **页面根节点必须带主题类**：
   ```xml
   <view class="app-root {{themeClass}}">
   ```
   并在 `onShow` 里 `this.setData({ themeClass: theme.getClass() })`
4. **按钮只用三种尺寸类**：`.btn`（主）/`.btn-secondary`（辅）/`.btn-text`（文字）
5. **可点区域 ≥ 88rpx**：小图标按钮要加 `min-height: var(--hit-min)`

### 待办（需要决策后统一做）

- [ ] 引入规范图标集（iconfont 或 PNG），替换 emoji
- [ ] tabBar 补 24pt 图标（当前纯文字）
- [ ] 拿到规范的「03 颜色」页后统一校色

---

## 9. 设计系统唯一真源

```
miniprogram/app.wxss     ← 所有 token 和公共组件类都在这里
```

**改样式先改这里**，不要在页面 wxss 里覆盖。页面 wxss 只放该页独有的布局样式。
