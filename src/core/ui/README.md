# core/ui

UI 支撑层。结构对齐 `template/admin/src/core/ui`，采用**扁平功能板块**划分，每个板块内再按组件名组织。

## 板块职责

| 目录 | 职责 | 来源 |
| --- | --- | --- |
| `layout/` | art 布局壳（`AppLayout`、侧边栏、顶栏、工作标签页、设置面板、锁屏、内容区等） | Art |
| `menu/` | 侧边菜单 / 横向菜单组件 | Art |
| `tabs/` | 工作标签页（`art-work-tab`） | Art |
| `common/` | UI 通用能力（如 `useVbenVxeGrid` 桥接、loading 等） | 混合 |
| `form/` | 表单相关工具与组件 | 混合 |
| `popup/` | 弹层 / 抽屉类组件 | 混合 |
| `primitives/` | 基础原子组件（按钮、输入等） | 混合 |
| `components/art/core/` | **art 可复用组件库**（按功能子类组织，见下） | Art |
| `demos/` | art 原生演示页（dashboard/examples/auth/exception/outside 等），仅用于静态路由 | Art |

## 组件自动注册

`unplugin-vue-components` 扫描以下目录，art 的 `Art*` 系列组件无需显式 import：

- `src/core/ui/components/art`
- `src/core/ui/layout`
- `src/core/ui/menu`
- `src/core/ui/tabs`

> 不要把 `common/form/popup/primitives` 纳入扫描，否则会与 `#/components`（admin 业务组件）产生 `Dialog/Select/Input/Upload` 等同名冲突。

## 引用约定

全部使用 `#/core/ui/...` 实际路径，不保留任何 `@/` 别名重定向（与 `template/admin` 一致）。

> 来源：Art (art-design-pro)，迁移自 `template/art-admin/src/art`。
