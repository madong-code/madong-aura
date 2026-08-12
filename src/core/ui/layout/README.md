# 来源：Art (art-design-pro)

迁移自 `template/art-admin/src/art/components/core/layouts` 与 `src/art/views/index/index.vue`，便于升级对照。

本目录为 art-design-pro 的布局壳与布局组件（AppLayout.vue 为根布局壳，以及 art-sidebar-menu/art-header-bar/art-settings-panel/art-page-content/art-screen-lock/art-global-component/art-breadcrumb/art-notification/art-global-search/art-chat-window/art-fireworks-effect/art-fast-enter）。

依赖已改写为 `#/core/*` 实际路径。组件经 `unplugin-vue-components` 自动注册（`dirs` 含 `src/core/ui/layout`）。

**升级注意**：art-design-pro 新版本若更新 `layouts`，请在此目录手动合并。
