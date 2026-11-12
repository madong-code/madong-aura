/**
 * 标准化「插件组件包装器模式」统一出口。
 *
 * 分层：
 * - plugin-component.vue       通用包装器核心（配置注入 / 透传适配 / 生命周期绑定）；
 * - define-plugin-component.ts 工厂：为插件组件生成预绑定包装器；
 * - define-plugin-config.ts    配置文件声明助手（配置复用机制入口）；
 * - merge-config.ts            配置合并规则（对象深合并，数组/函数/基础类型整体替换）；
 * - types.ts                   类型契约。
 *
 * 职责边界：包装器仅负责配置注入与通用逻辑封装，不解析业务字段、
 * 不侵入插件原有业务逻辑；插件组件按原生 props 消费配置，可插拔、可独立演进。
 */
export { definePluginComponent } from './define-plugin-component';
export { definePluginConfig } from './define-plugin-config';
export { mergePluginConfig } from './merge-config';
export { default as PluginComponent } from './plugin-component.vue';
export type {
  DefinePluginComponentOptions,
  PluginComponentConfig,
  PluginLifecycleHooks,
} from './types';
