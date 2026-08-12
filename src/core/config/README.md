# 来源：Art (art-design-pro)

迁移自 `template/art-admin/src/config`，便于升级对照。

本目录为 art-design-pro 的全局配置（AppConfig 自动导入源、setting、modules、assets）。`AppConfig` 由 `unplugin-auto-import` 扫描注入，迁移后需确认 auto-import 的 includes 指向 `src/core/config`。
