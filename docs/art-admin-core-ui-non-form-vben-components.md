# art-admin：src/core/ui 非表单 vben UI 组件依赖分析清单

> 目的：梳理 `src/core/ui/` 下从 vben（template/admin）迁移过来的**非表单** UI 组件，按引用状态分类（活跃 / 仅 core 内部 / 孤儿），为后续删除或替换提供决策依据。
>
> 范围：仅**分析产出清单**，本阶段未删改任何源文件。
> 生成时间：2026-08-12（基于 code-explorer 跨文件引用核验 + search_content/read_file 复核）

---

## 一、结论速览

- **A 类（views 业务视图直接引用，保留）**：约 15 个组件
- **B 类（仅 src/core 内部引用，保留）**：约 19 个 Vben\* 包装组件 + 一批活跃 reka-ui 原语
- **C 类（孤儿，可删/替换候选）**：约 47 个组件（含 primitives/components 孤儿、仅文档用 re-export、common/ui 孤儿、common/components 孤儿、reka 原语孤儿）

> 说明：`layout/`、`menu/`、`tabs/` 下的 `Art*` 组件属 art-design-pro 体系，由 `AppLayout.vue` 按名自动导入使用，**不在本清单删除范围**。`form/` 为表单相关，按要求排除。

---

## 二、架构关键事实（分类依据）

1. `src/components/*`（业务组件层）基于 **element-plus**（ElButton/ElDialog/ElInput 等），不直接依赖 vben 原语。
2. `src/views/*` 业务视图**不直接** `import '#/core/ui/primitives'`，vben 非表单原语仅 `src/core` 内部被使用。
3. `src/core/ui/common/components/index.ts` 有一批 `// 给文档用` 的 `Vben*` re-export（L5-22），大多**无真实消费方**。
4. `plugin/demo` 目录**已删除**（`src/views/app/plugin/` 下仅 delegation/develop/market），`generate-routes-backend.ts` 中的 `plugin/demo` 仅是**注释**。因此被原 demo 页面消费的组件（resize/count-to/json-viewer/ellipsis-text/cropper/tippy/captcha）对应的消费页面已不存在 → 判为**孤儿**。

---

## 三、A 类：views 业务视图直接引用（活跃，保留）

业务 `views/` 下 `import '#/core/ui/common'` 共 19 处，实际用到的组件：

| 组件 | 路径 | 引用方（views） | 作用 |
|---|---|---|---|
| `About` | `common/ui/about/about.vue` | `views/_core/about/index.vue` | 关于页 |
| `Fallback` | `common/ui/fallback/fallback.vue` | `views/_core/fallback/{offline,coming-soon}.vue`、`views/app/plugin/develop/index.vue` | 兜底页容器 |
| `AuthenticationRegister` | `common/ui/authentication/register.vue` | `views/_core/authentication/register.vue` | 注册 |
| `AuthenticationCodeLogin` | `common/ui/authentication/code-login.vue` | `views/_core/authentication/code-login.vue` | 验证码登录 |
| `AuthenticationForgetPassword` | `common/ui/authentication/forget-password.vue` | `views/_core/authentication/forget-password.vue` | 忘记密码 |
| `AuthenticationQrCodeLogin` | `common/ui/authentication/qrcode-login.vue` | `views/_core/authentication/qrcode-login.vue` | 二维码登录 |
| `WorkbenchProject` | `common/ui/dashboard/workbench/project.vue` | `views/dashboard/workspace/index.vue` | 工作台-项目 |
| `WorkbenchQuickNav` | `common/ui/dashboard/workbench/quick-nav.vue` | 同上 | 工作台-快捷导航 |
| `WorkbenchTodo` | `common/ui/dashboard/workbench/todo.vue` | 同上 | 工作台-待办 |
| `WorkbenchTrends` | `common/ui/dashboard/workbench/trends.vue` | 同上 | 工作台-动态 |
| `WorkbenchHeader` | `common/ui/dashboard/workbench/header.vue` | 同上 | 工作台-头部 |
| `AnalysisOverview` | `common/ui/dashboard/analysis/overview.vue` | `views/dashboard/{analytics,workspace}/index.vue` | 分析-概览 |
| `AnalysisChartsTabs` | `common/ui/dashboard/analysis/charts-tabs.vue` | 同上 | 分析-图表 |
| `AnalysisChartCard` | `common/ui/dashboard/analysis/chart-card.vue` | 同上 | 分析-图表卡 |
| `Page` | `common/components/page/page.vue` | `views/system/user/index.vue` 等多处（经 `#/components/page` re-export） | 页面容器 |

> `useVbenModal` / `useVbenDrawer`（来自 `#/core/ui/common`，实际 re-export 自 `#/core/ui/popup`）被 `devtools/terminal`、`content/notepad`、`content/message`、`system/dict` 等大量使用 → 活跃保留。

---

## 四、B 类：仅 src/core 内部引用（活跃，保留）

### B-1. primitives/components（Vben\* 包装组件）

| 组件 | 路径 | 被谁引用 | 作用 |
|---|---|---|---|
| `VbenButton` | `primitives/components/button/button.vue` | popup(modal/drawer/alert)、auth/profile 页、captcha、form | 按钮 |
| `VbenIconButton` | `primitives/components/button/icon-button.vue` | popup、icon-picker、tiptap、auth | 图标按钮 |
| `VbenButtonGroup`* | `primitives/components/button/button-group.vue` | 见 C 类（仅文档用，内部被 CheckButtonGroup 用） | 按钮组 |
| `VbenCheckbox` | `primitives/components/checkbox/checkbox.vue` | login、workbench-todo、form | 复选 |
| `VbenAvatar` | `primitives/components/avatar/avatar.vue` | profile、workbench-header、logo、login-expired | 头像 |
| `VbenInputPassword` | `primitives/components/input-password/input-password.vue` | form COMPONENT_MAP | 密码输入 |
| `VbenPinInput` | `primitives/components/pin-input/input.vue` | form | 验证码输入 |
| `VbenSelect` | `primitives/components/select/select.vue` | form | 选择器 |
| `VbenLoading` | `primitives/components/spinner/loading.vue` | popup、vxe-grid、loading | 加载态 |
| `VbenSpinner` | `primitives/components/spinner/spinner.vue` | common loading | 旋转加载 |
| `VbenTooltip` | `primitives/components/tooltip/tooltip.vue` | ellipsis-text、form-field | 提示 |
| `VbenHelpTooltip` | `primitives/components/tooltip/help-tooltip.vue` | modal、drawer、form-label、vxe-grid | 帮助提示 |
| `VbenPopover` | `primitives/components/popover/popover.vue` | icon-picker、tiptap | 弹层 |
| `VbenRenderContent` | `primitives/components/render-content/render-content.vue` | form、about、alert | 渲染内容 |
| `VbenCollapsible` | `primitives/components/collapsible/collapsible.vue` | form-field | 折叠 |
| `VbenExpandableArrow` | `primitives/components/expandable-arrow/expandable-arrow.vue` | form-actions | 折叠箭头 |
| `VbenSpineText` | `primitives/components/spine-text/spine-text.vue` | captcha | 逐字文本 |
| `VbenCountToAnimator` | `primitives/components/count-to-animator/count-to-animator.vue` | analysis-overview | 数字动画 |
| `VbenIcon` | `primitives/components/icon/icon.vue` | icon-picker、dashboard | 图标 |

> 带 `*` 的 `VbenButtonGroup` 在 B 类中被 `VbenCheckButtonGroup` 内部引用，但两者均仅"文档用"re-export，无真实消费 → 归入 C 类处理，故 B 类实际 18 个。

### B-2. primitives/ui（reka-ui 原语，活跃）

被 popup / form / dashboard / profile / captcha / icon-picker / plugins 等核心内部广泛引用，**保留**：
`Dialog` 系列、`Sheet` 系列、`AlertDialog` 系列、`Card` 系列（CardContent/Header/Title/Footer/Description）、`Tabs` 系列、`Button`、`Input`、`Pagination` 系列、`Resizable` 系列、`Form` 系列（FormControl/Description/Field/Item/Label/Message）、`Switch`、`Separator`、`Slot`、`VisuallyHidden`、`PinInput` 系列、`Label`、`Avatar` 系列、`Popover` 系列、`Tooltip` 系列、`Checkbox`、`Select` 系列、`createContext`。

### B-3. common/components（活跃）

- `Page` → 业务大量使用（`#/components/page` re-export）
- `IconPicker` → 被业务表单包装 `#/components/form/components/icon-picker` 使用

---

## 五、C 类：孤儿（无真实消费方，删除/替换候选）

### C-1. primitives/components 纯孤儿（仅自导出）

| 组件 | 路径 | 说明 |
|---|---|---|
| `VbenDropdownMenu` | `primitives/components/dropdown-menu/dropdown-menu.vue` | 仅自目录导出，无消费（业务用 ElDropdownMenu） |
| `VbenDropdownRadioMenu` | `primitives/components/dropdown-menu/dropdown-radio-menu.vue` | 仅被孤儿 VbenDropdownMenu 内部引用 |
| `VbenBackTop` | `primitives/components/back-top/back-top.vue` | 仅自导出 |
| `VbenBreadcrumbView` | `primitives/components/breadcrumb/breadcrumb-view.vue` | 仅自导出（业务用 ArtBreadcrumb） |
| `VbenHoverCard` | `primitives/components/hover-card/hover-card.vue` | 仅自导出 |
| `VbenScrollbar` | `primitives/components/scrollbar/scrollbar.vue` | 仅自导出 |
| `VbenSegmented` | `primitives/components/segmented/segmented.vue` | 仅自导出 |
| `VbenTree` | `primitives/ui/tree/tree.vue` | 仅被 common/tree（另一个孤儿）引用 |

### C-2. primitives/components 仅"给文档用" re-export

（`src/core/ui/common/components/index.ts` L5-22 的 `// 给文档用` 块中，re-export 本身无消费）

| 组件 | 路径 | 说明 |
|---|---|---|
| `VbenButtonGroup` | `primitives/components/button/button-group.vue` | 仅文档用；内部被 VbenCheckButtonGroup 引用 |
| `VbenCheckButtonGroup` | `primitives/components/button/check-button-group.vue` | 仅文档用 |
| `VbenCollapsibleParams` | `primitives/components/collapsible/collapsible-params.vue` | 仅文档用 |
| `VbenContextMenu` | `primitives/components/context-menu/context-menu.vue` | 仅文档用（原 demo 页面已删） |
| `VbenFullScreen` | `primitives/components/full-screen/full-screen.vue` | 仅文档用 |
| `VbenLogo` | `primitives/components/logo/logo.vue` | 仅文档用 |

### C-3. common/ui 孤儿

| 组件 | 路径 | 说明 |
|---|---|---|
| `AuthenticationLogin` | `common/ui/authentication/login.vue` | 仅自导出；业务登录页 `views/_core/authentication/login.vue` 是独立 element-plus 实现，不引用 |
| `AuthenticationLoginExpiredModal` | `common/ui/authentication/login-expired-modal.vue` | 仅自导出，无消费 |
| `Profile` | `common/ui/profile/profile.vue` | 仅自导出；业务 `views/_core/profile/*` 是独立实现 |
| `ProfileBaseSetting` | `common/ui/profile/base-setting.vue` | 仅自导出 |
| `ProfilePasswordSetting` | `common/ui/profile/password-setting.vue` | 仅自导出 |
| `ProfileSecuritySetting` | `common/ui/profile/security-setting.vue` | 仅自导出 |
| `ProfileNotificationSetting` | `common/ui/profile/notification-setting.vue` | 仅自导出 |

### C-4. common/components 孤儿 / 原 demo 消费

> 以下组件原被 `plugin/demo/views/widgets/*` 消费，但 `plugin/demo` 目录已删除 → 实际孤儿。

| 组件 | 路径 | 说明 |
|---|---|---|
| `ApiComponent` | `common/components/api-component/api-component.vue` | 无组件消费；仅 `ApiComponentSharedProps` 类型被 `adapter/component/index.ts` 消费（类型层面）。业务用 `#/components/form/components/api-component`（独立实现） |
| `ColPage` | `common/components/col-page/col-page.vue` | 无消费 |
| `Resize` | `common/components/resize/resize.vue` | 原被 `plugin/demo/views/widgets/resize/basic.vue` 消费（已删） |
| `Tree` | `common/components/tree/tree.vue` | 无消费；内部引用孤儿 VbenTree |
| `CountTo` | `common/components/count-to/count-to.vue` | 原被 `plugin/demo/views/widgets/count-to` 消费（已删）。**注意**：analysis-overview 用的是 `VbenCountToAnimator`，非此组件 |
| `JsonViewer` | `common/components/json-viewer/index.vue` | 原被 `plugin/demo/views/widgets/json-viewer` 消费（已删） |
| `EllipsisText` | `common/components/ellipsis-text/ellipsis-text.vue` | 原被 `plugin/demo/views/widgets/ellipsis` 消费（已删） |
| `VCropper` | `common/components/cropper/cropper.vue` | 原被 `plugin/demo/views/widgets/cropper` 消费（已删） |
| `Tippy` | `common/components/tippy/*` | 原被 `plugin/demo/views/widgets/tippy` 消费（已删）；`initTippy`/`v-tippy` 无外部调用 |
| `SliderCaptcha` | `common/components/captcha/slider-captcha.vue` | 原被 `plugin/demo/views/widgets/captcha/slider-captcha.vue` 消费（已删） |
| `PointSelectionCaptcha` | `common/components/captcha/point-selection-captcha.vue` | 无消费 |
| `SliderRotateCaptcha` | `common/components/captcha/slider-rotate-captcha.vue` | 无消费 |
| `SliderTranslateCaptcha` | `common/components/captcha/slider-translate-captcha.vue` | 无消费 |

### C-5. primitives/ui 孤儿 reka-ui 原语

> 以下原语无任何活跃 wrapper 或业务消费，可连同依赖链一并删除：

| 原语 | 路径 | 说明 |
|---|---|---|
| `Accordion*` | `primitives/ui/accordion/*` | 无 wrapper、无消费 |
| `Badge` | `primitives/ui/badge/Badge.vue` | 无消费 |
| `NumberField*` | `primitives/ui/number-field/*` | 无消费 |
| `RadioGroup*` | `primitives/ui/radio-group/*` | 无消费（业务用 el-radio-group） |
| `Toggle` | `primitives/ui/toggle/*` | 无消费 |
| `ToggleGroup*` | `primitives/ui/toggle-group/*` | 仅引用自身 Toggle |
| `Textarea` | `primitives/ui/textarea/Textarea.vue` | 无消费（业务用 ElInput textarea） |
| `Breadcrumb*` | `primitives/ui/breadcrumb/*` | 仅被孤儿 `VbenBreadcrumbView` 引用（C-1） |
| `ContextMenu*` | `primitives/ui/context-menu/*` | 仅被孤儿 `VbenContextMenu` 引用（C-2） |
| `DropdownMenu*` | `primitives/ui/dropdown-menu/*` | 仅被孤儿 `VbenDropdownMenu` 引用（C-1） |
| `HoverCard*` | `primitives/ui/hover-card/*` | 仅被孤儿 `VbenHoverCard` 引用（C-1） |
| `ScrollArea`/`ScrollBar` | `primitives/ui/scroll-area/*` | 仅被孤儿 `VbenScrollbar` 引用（C-1） |
| `Tree` | `primitives/ui/tree/tree.vue` | 仅被孤儿 common/tree 引用（C-4） |

---

## 六、删除影响面（需同步清理的入口 re-export）

> 删除任一孤儿组件，必须同步移除对应入口文件中的 re-export，否则会留下"导出了不存在模块"的报错。

### 6.1 `src/core/ui/common/components/index.ts`（43 行）

- **L5-22**：`// 给文档用` 块中移除孤儿：`VbenButtonGroup`、`VbenCheckButtonGroup`、`VbenCollapsibleParams`、`VbenContextMenu`、`VbenFullScreen`、`VbenLogo`
  - 保留该块中活跃的：`VbenAvatar`、`VbenButton`、`VbenCheckbox`、`VbenCountToAnimator`、`VbenIconButton`、`VbenInputPassword`、`VbenLoading`、`VbenPinInput`、`VbenSelect`、`VbenSpinner`
- **L28**：`export * from './api-component'` → 删（孤儿）
- **L29**：`export * from './captcha'` → 删（孤儿）
- **L30**：`export * from './col-page'` → 删（孤儿）
- **L31**：`export * from './count-to'` → 删（孤儿）
- **L32**：`export * from './cropper'` → 删（孤儿）
- **L33**：`export * from './ellipsis-text'` → 删（孤儿）
- **L35**：`export * from './json-viewer'` → 删（孤儿）
- **L36**：`export * from './loading'` → **保留**（VbenLoading/VbenSpinner 活跃）
- **L37**：`export * from './page'` → **保留**（活跃）
- **L39**：`export * from './resize'` → 删（孤儿）
- **L41**：`export * from './tippy'` → 删（孤儿）
- **L42**：`export * from './tree'` → 删（孤儿）
- **L34**：`export * from './icon-picker'` → **保留**（活跃）

### 6.2 `src/core/ui/primitives/components/index.ts`（24 行）

全部为 `export * from './xxx'`，删除孤儿对应行：
- `back-top` → 删
- `breadcrumb` → 删（内含 VbenBreadcrumbView 孤儿 + 其引用的原语）
- `context-menu` → 删
- `dropdown-menu` → 删
- `full-screen` → 删
- `hover-card` → 删
- `logo` → 删
- `scrollbar` → 删
- `segmented` → 删
- **保留**：`avatar`、`button`（注意 button-group/check-button-group 在此目录内，若只删目录会连带；建议按文件粒度清理）、`checkbox`、`collapsible`（保留 VbenCollapsible、删 VbenCollapsibleParams）、`count-to-animator`、`expandable-arrow`、`icon`、`input-password`、`pin-input`、`popover`、`render-content`、`select`、`spine-text`、`spinner`、`tooltip`

> 注意：`button`、`collapsible` 目录内既有活跃又有孤儿子组件（如 button 下 button.vue 活跃 + button-group.vue/check-button-group.vue 孤儿），不能整目录删，需按文件粒度处理，并从对应 index.ts 中删除孤儿命名导出。

### 6.3 `src/core/ui/common/ui/index.ts`（5 行）

- L1 `./about` → 保留
- L2 `./authentication` → 需在 `authentication/index.ts` 中移除孤儿命名导出（见 6.4）
- L3 `./dashboard` → 保留
- L4 `./fallback` → 保留
- L5 `./profile` → 若删 Profile 系列，移除 L5；`common/ui/profile/` 整目录可删

### 6.4 `src/core/ui/common/ui/authentication/index.ts`（8 行）

- L3 `AuthenticationLoginExpiredModal` → 删
- L4 `AuthenticationLogin` → 删
- **保留**：L1 CodeLogin、L2 ForgetPassword、L5 QrCodeLogin、L6 Register、L7 type AuthenticationProps

### 6.5 `src/core/ui/primitives/index.ts`（4 行）

- L1 `export * from './components'` → 保留（内部已按 6.2 清理）
- L2 `export * from './ui'` → 保留（内部已按 6.5 清理原语）
- L3 `export { createContext, Slot, VisuallyHidden } from 'reka-ui'` → 保留

### 6.6 `src/core/ui/primitives/ui/index.ts`（31 行，全部为 `export * from './xxx'`）

移除孤儿原语目录对应行：
- L1 `./accordion` → 删
- L4 `./badge` → 删
- L5 `./breadcrumb` → 删
- L10 `./dropdown-menu` → 删
- L12 `./hover-card` → 删
- L15 `./number-field` → 删
- L19 `./radio-group` → 删
- L21 `./scroll-area` → 删
- L27 `./textarea` → 删
- L28 `./toggle` → 删
- L29 `./toggle-group` → 删
- L31 `./tree` → 删
- **保留**：L2 alert-dialog、L3 avatar、L6 button、L7 card、L8 checkbox、L9 dialog、L11 form、L13 input、L14 label、L16 pagination、L17 pin-input、L18 popover、L20 resizable、L22 select、L23 separator、L24 sheet、L25 switch、L26 tabs、L30 tooltip

### 6.7 目录内混用"活跃+孤儿"的文件（按文件粒度清理）

- `primitives/components/button/index.ts`（5 行）：L2 `VbenButtonGroup` → 删、L4 `VbenCheckButtonGroup` → 删；保留 L1 type、L3 `VbenButton`、L5 `VbenIconButton`
- `primitives/components/collapsible/index.ts`（5 行）：L1 `VbenCollapsibleParams` → 删；保留 L2 `VbenCollapsible`、L4 type

---

## 七、依赖链删除提醒

删除孤儿时注意整条依赖链（避免残留 import 报错）：

1. `Breadcrumb*`（原语）← `VbenBreadcrumbView`（C-1）→ `common/components/index.ts` 无直接导出（BreadcrumbView 仅在 primitives 内）
2. `ContextMenu*`（原语）← `VbenContextMenu`（C-2）
3. `DropdownMenu*`（原语）← `VbenDropdownMenu`/`VbenDropdownRadioMenu`（C-1）
4. `HoverCard*`（原语）← `VbenHoverCard`（C-1）
5. `ScrollArea`（原语）← `VbenScrollbar`（C-1）
6. `VbenTree`（C-1）← `common/components/tree`（C-4）← `common/components/index.ts` L42
7. `VbenButtonGroup`（C-2）→ 内部被 `VbenCheckButtonGroup`（C-2）引用

---

## 八、建议执行顺序（后续决策用）

若决定删除，建议按依赖顺序：

1. 先删 `primitives/ui` 孤儿原语（最底层，无上游）
2. 再删 `primitives/components` 孤儿 wrapper（依赖原语已删）
3. 同步清理 `primitives/components/index.ts`、`primitives/ui/index.ts`
4. 再删 `common/ui` 孤儿（login/login-expired-modal/profile 系列）+ 清理 `common/ui/authentication/index.ts`、`common/ui/index.ts`
5. 再删 `common/components` 孤儿 + 清理 `common/components/index.ts`
6. 最后 `build` / `lint` 校验无残留 import

> 当前 B 类活跃组件（popup/form/dashboard 依赖）一律保留，不在此删除范围。
