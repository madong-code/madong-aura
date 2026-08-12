// ──────────────────────────────────────────────
// 模块市场组件 Barrel Export
// ──────────────────────────────────────────────

// 授权版模块市场（已授权插件管理，仅安装/卸载菜单/更新数据库，对接 /tenant/plugin 接口）
export { default as GrantedModuleMarket } from './granted/granted-module-market.vue';

// 路由
export { default as MarketRouter } from './market-router.vue';

// 单体版模块市场（完整移植自 madong-vue）
export { default as StandaloneModuleMarket } from './standalone/standalone-module-market.vue';
