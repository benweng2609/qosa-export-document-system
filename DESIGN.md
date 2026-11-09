---
name: 外贸单证系统
description: 以 A4 纸张为中心的冷静、高密度外贸制单工作台。
colors:
  action-blue: "#1D4ED8"
  action-blue-hover: "#1E40AF"
  ink-slate: "#172033"
  muted-slate: "#64748B"
  app-grey: "#F5F7FA"
  panel-white: "#FFFFFF"
  subtle-grey: "#F8FAFC"
  border-grey: "#E2E8F0"
typography:
  headline:
    fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, Noto Sans, system-ui, sans-serif'
    fontSize: 24px
    fontWeight: 650
    lineHeight: 32px
    letterSpacing: -0.02em
  title:
    fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, Noto Sans, system-ui, sans-serif'
    fontSize: 18px
    fontWeight: 650
    lineHeight: 26px
  body:
    fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, Noto Sans, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'Noto Sans SC, PingFang SC, Microsoft YaHei, Noto Sans, system-ui, sans-serif'
    fontSize: 13px
    fontWeight: 550
rounded:
  control: 6px
  panel: 10px
  overlay: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
components:
  button-primary:
    background: "{colors.action-blue}"
    color: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: 8px 14px
  button-primary-hover:
    background: "{colors.action-blue-hover}"
    color: "#FFFFFF"
    rounded: "{rounded.control}"
  input-default:
    background: "{colors.panel-white}"
    color: "{colors.ink-slate}"
    borderColor: "#CBD5E1"
    rounded: "{rounded.control}"
    padding: 8px 10px
  panel-default:
    background: "{colors.panel-white}"
    borderColor: "{colors.border-grey}"
    rounded: "{rounded.panel}"
    padding: 16px
---

# Design System: 外贸单证系统

## Overview

**Creative North Star: "The Paper-First Workbench"**

外贸单证系统是一张围绕纸张组织的工作台，而不是装饰性 dashboard。冷灰工作区承载高密度表单，白色面板和 A4 纸张保持清晰边界，品牌蓝只负责当前选择、关键动作和焦点。用户应先看清单证状态与下一步，再注意到视觉风格。

系统以结构化录入和即时纸张反馈为核心。编辑器没有自由拖拽画布，也不把主数据、金额或版式状态藏在多层页面之后；表单、预览和导出共享同一份事实。视觉表达服务于长时间录入、复核和导出。

**Key Characteristics:**
- 纸张是视觉中心，蓝色只标记行动与当前状态。
- 细边框、紧凑节奏和明确对齐优先于装饰性卡片。
- 桌面三栏协作，手机保留编辑、预览和固定下载闭环。
- 多语言、多页和空状态沿用同一套单证语法。
- 贸易单证与 AMS／ISF／VGM／SI 专用资料单共享纸张语言，但不混用价格、付款或银行区块。

## Colors

主色与冷中性色构成全部应用外壳；纸张主题色只在单证内容中变化，不改变工作台的交互语义。

### Primary
- **Action Blue**（#1D4ED8）：主按钮、当前步骤、选中项、键盘焦点与纸张主题默认色。
- **Action Blue Hover**（#1E40AF）：主色 hover 与按下状态，不另引入高亮蓝。

### Neutral
- **Ink Slate**（#172033）：正文、表单值和纸张主要信息。
- **Muted Slate**（#64748B）：辅助说明、时间、次要标签与占位文本。
- **App Grey**（#F5F7FA）：应用背景与纸张预览舞台。
- **Panel White**（#FFFFFF）：侧栏、表单面板、工具栏、纸张和浮层。
- **Subtle Grey**（#F8FAFC）：表头、只读信息带和轻微状态分层。
- **Border Grey**（#E2E8F0）：默认分隔线、表格与面板边界。

**The Single Action Voice Rule.** 同一视图只保留一个品牌蓝主行动；辅助操作使用白底、灰字或文字按钮，避免多个主按钮争夺任务优先级。

## Typography

**Display / Body Font:** Noto Sans SC（PingFang SC、Microsoft YaHei、Noto Sans、system-ui 回退）。

**Character:** 中文与拉丁字符共用清晰的无衬线骨架；字重和字号承担层级，不使用斜体中文或装饰性展示字体。

### Hierarchy
- **Headline**（650，24px / 32px，-0.02em）：页面标题；手机降为 21px / 29px。
- **Title**（650，18px / 26px）：区块标题与重要面板标题。
- **Body**（400，14px / 1.55）：表单、表格与操作说明。
- **Label**（550，13px）：字段标签与紧凑导航；表格辅助文字可降至 11–12px。
- **Data**（550–700，表格数字）：金额、数量与编号使用 tabular-nums，右对齐或按表格列规则对齐。

**The Real Copy Rule.** 所有字号与换行以真实单证编号、客户名、商品说明和多语言标签验证；不允许为了维持单行而截断关键业务信息。

## Layout

桌面应用采用固定侧栏、60px 顶栏和内容区。核心编辑器为 176px 步骤导航、420px 结构化表单与自适应预览舞台；模板编辑使用宽幅双栏工作区，左侧设置、右侧实时 A4 示例。A4 HTML 纸张固定为 794 × 1123，通过缩放适配，不改变内容分页规则。1280px 下步骤导航折叠为图标，为表单和纸张保留空间。

间距以 4 / 8 / 12 / 16 / 24 / 32px 为节奏，相关字段紧密、业务区块分离。767px 以下改为单栏：侧栏变为抽屉，编辑器和模板工作区使用“编辑 / 预览”页签，主下载按钮固定在底部安全区；输入至少 16px，触控目标至少 44px。

## Elevation & Depth

应用面板默认依靠细边框和灰白分层，不叠加厚重阴影。阴影保留给纸张、浮层和移动主行动，表达实际层级而非装饰。

### Shadow Vocabulary
- **Paper**（`0 3px 16px #0F172A1F`）：A4 纸张与预览舞台分离。
- **Dialog**（`0 18px 50px #0F172A26`）：模态确认与受保护任务。
- **Drawer**（`-18px 0 50px #0F172A1F`）：右侧资料编辑抽屉。
- **Mobile Action**（`0 5px 18px #1E40AF33`）：手机固定下载按钮与底部边界分离。

**The Flat Work Surface Rule.** 工作面板保持平面；只有纸张、浮层或固定主行动可以浮起。

## Shapes

控件使用 6px 圆角，业务面板使用 10px，对话框使用 12px。边框优先于阴影，表格和列表用细分隔线维持扫描节奏。开关等小型系统控件可使用胶囊形，但不把业务面板胶囊化。

## Components

### Buttons
- **Shape:** 6px 圆角，桌面最小高度 38px，手机 44px。
- **Primary:** #1D4ED8 背景、白字、8px 14px 内边距；hover 为 #1E40AF。
- **Secondary / Ghost:** 白底细边框或透明灰字，用于返回、编辑与辅助操作。
- **States:** hover 150–160ms ease-out，active 仅 1px 位移；focus-visible 使用 2px 品牌蓝轮廓和 2px offset。

### Inputs / Fields
- **Style:** 白底、#CBD5E1 边框、6px 圆角、8px 10px 内边距。
- **Focus:** 边框转为品牌蓝，辅以 `0 0 0 3px #1D4ED814`。
- **Error / Disabled:** 错误命名问题和恢复方式；禁用降低不透明度，不用禁用态隐藏必要说明。

### Navigation
- **Style:** 白底侧栏与细右边界；当前项使用浅蓝底、蓝字和清晰图标。
- **Responsive:** 1280px 编辑器步骤折叠为图标，手机侧栏转为带遮罩抽屉。
- **Keyboard:** 所有导航和纸张可定位区块均可聚焦并支持 Enter / Space。

### Cards / Containers
- **Corner Style:** 10px 业务面板，8–10px 选择项。
- **Background:** 白底配 #E2E8F0 细边框，不使用嵌套卡片堆砌层级。
- **Internal Padding:** 14–16px 为主，密集表格使用 10–14px 单元格节奏。

### Status Chips
- **Style:** 小型浅色状态标记，草稿、完成、归档使用稳定语义色。
- **State:** 只表达状态，不伪装成可点击筛选器；筛选使用标准 select。

### A4 Paper Preview
- **Structure:** 固定 A4 比例、统一页边距、重复表头和页码，最后一页承载合计、条款与签署区。
- **Feedback:** 表单修改、类型、语言、主题和印章开关即时反映；点击纸张区块定位对应编辑区块。
- **Export:** PDF 与 HTML 共用分页函数和结构化数据，PDF 使用标准 A4 与可选择文字。
- **Special Forms:** AMS／ISF 固定显示资料准备稿提示；VGM 以集装箱卡片呈现两种计算方法与实时合计，SI 将放单要求独立成区，均不使用贸易金额栏。

## Do's and Don'ts

### Do:
- **Do** 让下载 PDF 成为编辑器唯一主行动，并显示真实生成进度或错误。
- **Do** 使用 tabular-nums 对齐金额、件数、重量和编号。
- **Do** 在手机保留编辑、预览和固定下载的完整闭环。
- **Do** 明确标注“仅保存在当前浏览器”，将印章描述为单证图像。
- **Do** 用真实多语言、长商品说明和两页单证检查布局。

### Don't:
- **Don't** 把工作台改成营销首页、自由拖拽画布或装饰性指标 dashboard。
- **Don't** 用多个品牌蓝主按钮竞争同一视图的注意力。
- **Don't** 用灰色文字放在彩色表面上充当次要文本，或牺牲对比度换取轻盈感。
- **Don't** 伪造云端保存、PDF 成功、法律电子签名或真实企业数据。
- **Don't** 在装箱单默认视图中显示单价和金额。
