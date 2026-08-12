# components/art/core — art 可复用组件库

art-design-pro 提供的通用 UI 组件，按**功能子类**分类。迁移自
`template/art-admin/src/art/components/core`，现归属 `core/ui` 板块。

## 子类说明

| 目录 | 内容 |
| --- | --- |
| `banners/` | 横幅 / Banner 组件 |
| `base/` | 基础原子组件（如渐变按钮、图标等） |
| `cards/` | 卡片组件（含图表卡片） |
| `charts/` | ECharts 图表封装（`art-bar-chart`、`art-line-chart`、`art-pie-chart` 等） |
| `forms/` | 表单增强组件（如 `art-wang-editor` 富文本） |
| `layouts/` | 布局相关小组件 |
| `media/` | 媒体组件（如视频播放器封装） |
| `others/` | 杂项（水印 `art-watermark`、菜单右侧 `art-menu-right` 等） |
| `tables/` | 表格组件（`art-table`、`art-table-header`） |
| `text-effect/` | 文字特效（滚动文字、节日文字等） |
| `theme/` | 主题相关小组件 |
| `views/` | 视图级复用组件（登录 `AuthTopBar`、异常 `ArtException` 等） |
| `widget/` | 小部件（统计卡片、进度等） |

## 引用约定

统一使用 `#/core/ui/components/art/core/<子类>/<组件>/index.vue` 实际路径，
由 `unplugin-vue-components` 自动注册为 `Art*` 全局组件。

> 来源：Art (art-design-pro)，迁移自 `template/art-admin/src/art/components/core`。
