# visual-flow

基于 **Vue 3 + Vite + LogicFlow** 的可视化流程设计器（工作流设计器）私有库，**单包、多场景**：

- **canvas 画布模式**：基于 LogicFlow 的拖拽式流程画布
- **dingtalk 钉钉模式**：钉钉风格树形设计器（适合审批流等线性流程）
- 两种模式通过组件 `mode` prop 切换，同一份源码、同一组件入口

> 本项目重构为**单一 `visual-flow` 包 + 多场景**结构，
> 采用**私有 lib 模式**（`private: true`，不发布 npm），供内部/本地工程直接引入。
>
> 📄 **详细二次开发文档见 [`docs/二次开发指南.md`](docs/二次开发指南.md)**（随 `lib/` 构建产物一起输出）。

## 特性

- 零 UI 框架依赖：内置自研 FD 组件族（抽屉/弹窗/表单/下拉/提示/JSON 查看器），不依赖 ant-design-vue / element-plus / vue-json-pretty
- 双模式渲染：`mode="canvas" | "dingtalk"`，同一组件入口切换
- 补全内置工作流属性：流程级 +8（字段权限/关联业务表/持久化模式/发起时选人/选人接口/抄送人/申请理由/附件）、任务级 +6（候选用户/候选用户组/候选用户处理类/会签类型/会签完成条件/操作按钮）
- 会签角标与成员进度回显、空流程默认初始化、移动端自适应
- 支持主题配置、节点高亮、拖拽面板、控制面板、自定义节点/边
- **暗黑 / 明亮主题**：基于 CSS 变量，面向其他框架，设置 `data-theme="dark"` 即可全局切换
- **钉钉模式暴露 `FDDesignerAPI`（与 LogicFlow 实例兼容命名），二次开发代码双模式零修改复用**

## 目录结构

```
visual-flow/
├── package.json                # 包名 visual-flow，private lib，不发布
├── vite.config.ts              # 演示站构建（examples/）
├── vite.config.lib.ts          # 唯一库构建 → ./lib
├── docs/                       # 详细二次开发文档（构建时复制进 lib/）
├── packages/
│   └── visual-flow/            # ★ 唯一子包（单包多场景）
│       ├── index.ts            # 唯一双模式入口
│       ├── src/                # 源码（index.vue 双模式主组件 + node/edge/plugins/ui/dingtalk）
│       ├── assets/theme.css    # 主题变量层（明亮/暗黑 design tokens，库自带）
│       └── types/              # 类型声明（declare module 'visual-flow'）
└── examples/                   # 演示站（多场景 cases）
```

## 开发

```shell
npm install        # 或 pnpm install
npm run dev        # 启动演示站（examples/）
npm run build:lib  # 构建私有库 → ./lib（含 README + docs/）
```

## 本地引入（真实业务工程）

> ⚠️ 本项目是**私有 lib（`private: true`，不发布 npm）**。真实业务工程要 `import 'visual-flow'`，
> 必须先让工程能解析到这个包名。**不要照抄演示站**——演示站（`examples/`）是直接引源码
> `../../packages/visual-flow/index`，那是开发时热更用途，不是业务工程的引入方式。

### 方式一：pnpm workspace（推荐，同仓开发）

业务工程与 `visual-flow` 放在同一个 pnpm workspace 时，直接在业务工程里：

```shell
# 在业务工程目录
pnpm add visual-flow@workspace:* --workspace
```

```ts
import FlowDesigner from 'visual-flow'
import 'visual-flow/lib/style.css'
```

> 前提：业务工程的 `pnpm-workspace.yaml` 需包含本库路径，例如：
> ```yaml
> packages:
>   - apps/*
>   - packages/*   # 含本库
> ```

### 方式二：npm link（本地软链）

不在同一 workspace，但想本地联调：

```shell
# ① 在本库目录
npm link            # 把 visual-flow 注册到全局 node_modules

# ② 在业务工程目录
npm link visual-flow
```

```ts
import FlowDesigner from 'visual-flow'
import 'visual-flow/lib/style.css'
```

> 注：`npm link` 后 `visual-flow` 会指向本库源码目录。若业务工程是 Vite/Vue3，
> 建议在 `vite.config.ts` 对该包 `optimizeDeps.exclude` 或 `resolve.alias` 指向 `lib/visual-flow.js`，
> 避免直接编译源码带来的兼容问题。

### 方式三：构建产物别名引入

不 link、不 workspace，直接把构建产物映射到包名：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      'visual-flow': fileURLToPath(new URL('./node_modules/visual-flow/lib/visual-flow.js', import.meta.url)),
    },
  },
})
```

> 需先把本库 `lib/` 产物拷贝/安装进业务工程 `node_modules/visual-flow/`（或通过 `file:` 依赖）。

### 引入代码

安装完成后，三者的**业务代码写法一致**：

```ts
import { createApp } from 'vue'
import FlowDesigner from 'visual-flow'
import 'visual-flow/lib/style.css'

createApp(App).use(FlowDesigner).mount('#app')
```

```html
<VisualFlow v-model:value="graphData" mode="dingtalk" @on-save="handleSave" />
```

> 组件注册名为 `VisualFlow`；`mode` 缺省时按 `prop > 数据字段 mode > 默认 'canvas'` 解析。

### 按需导出

包入口还暴露了与 LogicFlow 相关的命名导出，业务工程可按需引入：

```ts
import FlowDesigner, {
  LogicFlow,            // @logicflow/core 默认导出
  LogicFlowCore,        // @logicflow/core 命名空间
  LogicFlowExtension,   // @logicflow/extension
} from 'visual-flow'
```

---

## 暗黑 / 明亮主题对接（面向其他框架）

`visual-flow` 内置一套**基于 CSS 变量的主题体系**（design tokens），支持「明亮 / 暗黑」切换，且**不绑定任何框架**（Vue / React / 原生均可）。库自带主题样式随包打包引入，宿主无需额外加载主题文件。

### 一、原理

- 库的样式里定义了两套 CSS 变量：
  - `:root` / `:root[data-theme='light']` → **明亮**（默认）
  - `[data-theme='dark']` → **暗黑**
- 所有组件（FD 组件族、钉钉模式、画布/拖拽/控制面板）都消费这些变量。
- 只需给**根节点**（`<html>` 或任意宿主容器）设置 `data-theme="dark"`，整库即可切换暗黑。

### 二、快速开始

**1. 引入组件**

```ts
import { createApp } from 'vue'
import FlowDesigner from 'visual-flow'
import 'visual-flow/lib/style.css'

createApp(App).use(FlowDesigner).mount('#app')
```

> `lib/style.css` 已包含主题变量层（`theme.css` 与组件样式），**无需再单独引主题文件**。

**2. 切换到暗黑**（任选一种）

```js
// 方式 A：直接设置 html 根节点属性
document.documentElement.setAttribute('data-theme', 'dark')

// 方式 B：给任意宿主容器设置（局部暗黑，仅影响该容器内部）
document.getElementById('my-flow').setAttribute('data-theme', 'dark')

// 方式 C：配合自己的主题切换（如 antd/vant/element 等框架的主题方案），
//         在框架切换暗黑时同步设置 data-theme
```

**3. 切换回明亮**

```js
document.documentElement.removeAttribute('data-theme')
```

### 三、与宿主框架主题联动

业务工程通常有自己的主题方案，只需在宿主切换主题时**同步设置 `data-theme`** 即可联动：

```ts
// 示例：与 Element Plus / Ant Design 暗黑模式联动
// 在框架主题变化时执行：
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
```

- 库的画布（`applyCanvasTheme` + `MutationObserver`）会**自动监听** `data-theme` 变化并实时刷新画布背景/网格/节点颜色，无需手动重建。

### 四、自定义主题色

通过 CSS 变量覆盖，可调整库的主题色（不限于明暗，可自定义品牌色）：

```css
/* 覆盖主色（明亮下） */
:root {
  --fd-primary-color: #ff6b35;   /* 换成你的品牌色 */
}

/* 覆盖暗黑下的主色 */
:root[data-theme='dark'] {
  --fd-primary-color: #ff8a5c;
}
```

**核心变量速查**（`packages/visual-flow/src/assets/theme.css`）：

| 变量 | 说明 | 明亮默认 | 暗黑默认 |
| --- | --- | --- | --- |
| `--fd-bg-page` | 页面/画布背景 | `#f5f7fa` | `#141414` |
| `--fd-bg-container` | 容器/卡片/弹窗背景 | `#ffffff` | `#1f1f1f` |
| `--fd-bg-subtle` | 次级/悬浮背景 | `#fafafa` | `#262626` |
| `--fd-text-primary` | 主文字 | `#303133` | `#e5e6eb` |
| `--fd-text-regular` | 常规文字 | `#606266` | `#c9cdd4` |
| `--fd-text-secondary` | 次要文字 | `#909399` | `#8a8f99` |
| `--fd-border-color` | 常规边框 | `#e4e7ed` | `#3a3a3a` |
| `--fd-primary-color` | 主题色 | `#3068ec` | `#4d9fff` |
| `--fd-primary-bg` | 主题色浅底 | `#e8f0fe` | `#1d2a3a` |
| `--fd-canvas-bg` | 画布背景 | `#ffffff` | `#1a1a1a` |
| `--fd-canvas-grid` | 画布网格线 | `#f0f0f0` | `#2a2a2a` |
| `--fd-node-stroke` | 画布节点边框 | `#22262a` | `#e5e6eb` |
| `--fd-node-fill` | 画布节点填充 | `#ffffff` | `#1f1f1f` |
| `--fd-edge-stroke` | 画布连线 | `#22262a` | `#c9cdd4` |

钉钉模式额外使用 `--ding-*` 前缀变量，暗黑下同样被自动覆盖，无需单独处理。

### 五、注意事项

- **画布模式**：切换 `data-theme` 后画布通过 `MutationObserver` 自动刷新背景/网格/节点颜色，**无需重建实例**。
- **钉钉模式**：使用 `--ding-*` 变量 + `:root[data-theme="dark"]` 覆盖，随主题自动切换。
- **局部暗黑**：若只希望某个容器暗黑，给该容器设 `data-theme="dark"` 即可（CSS 变量作用域继承）。
- **样式加载顺序**：库的 `theme.css`/`flow.css` 随 `lib/style.css` 打包，宿主只需保证 `import 'visual-flow/lib/style.css'` 在业务样式之前/之后均可用（变量层用高优先级选择器兜底）。

---

## 属性说明（速查）

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| v-model:value | object | - | 流程图数据 |
| theme | FDThemeConfig | - | 主题配置 |
| highLight | FDHighLightType | - | 高亮配置 |
| initDndPanel | boolean | true | 是否初始化拖拽面板 |
| dndPanel | FDPatternItem | - | 拖拽面板配置 |
| initControl | boolean | true | 是否初始化控制面板 |
| control | FDControlItem | - | 控制面板配置 |
| blankContextmenu | Function | - | 画布右键事件 |
| nodeClick | Function | - | 节点点击事件 |
| edgeClick | Function | - | 边点击事件 |
| drawerWidth | String/Number | 600px | 抽屉宽度 |
| modalWidth | String/Number | 60% | 弹窗宽度 |
| processForm | FDFormType | - | 流程表单配置 |
| edgeForm | FDFormType | - | 边表单配置 |
| defaultEdgeType | string | ingenious:transition | 默认边 |
| typePrefix | string | ingenious: | 自定义节点/边类型前缀 |
| viewer | boolean | false | 是否查看模式 |
| dagreOptions | Object | - | 自动布局配置 |
| mode | 'canvas' \| 'dingtalk' | 'canvas' | 渲染模式 |

## 事件（速查）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| on-init | 初始化事件 | (lf: any) => void |
| on-render | 渲染事件 | (lf: any) => void |
| on-save | 控制面板保存事件 | (graphData: any) => void |
| node-click | 节点点击事件 | ({ data, patternItem, lf }) => void |
| edge-click | 边点击事件 | ({ data, patternItem, lf }) => void |

## 演示站

`examples/` 内置多个业务场景 case（首页画布/钉钉基础演示、vben5 process-drawer 风格、节点 API 操作、钉钉预览模式、会签进度回显、二次开发能力、**二开文档示例**（自定义节点 SVG/HTML/Vue + 自定义边 + render 表单）），并支持移动端 375px 预览。运行 `npm run dev` 后通过顶部导航切换，也可用 `#/case-key` hash 直达。

---

## 二次开发

详细二开文档见 [`docs/二次开发指南.md`](docs/二次开发指南.md)，涵盖：

- 架构总览（双模式、目录、数据流）
- 自定义节点（SVG / HTML / Vue）/ 自定义边 / 自定义表单（含 render）/ 自定义控制面板
- 事件系统、钉钉模式 `FDDesignerAPI`、主题适配、查看模式
- 常见二次开发场景速查、注意事项

> 该文档会随 `npm run build:lib` 复制进 `lib/docs/`，业务工程在 `node_modules/visual-flow/docs/` 下即可查看。
