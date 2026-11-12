/**
 * 标准化「插件组件包装器模式」类型契约。
 *
 * 设计原则（职责边界）：
 * - 包装器只做三件事：配置注入 / 通用逻辑封装（合并、透传）/ 生命周期绑定；
 * - 不解析、不感知任何业务配置字段；插件组件按原生 props 正常声明即可消费配置；
 * - 不侵入插件原有业务逻辑，包装层与插件层零耦合，保证插件可插拔、可独立演进。
 */

/** 插件组件配置：任意键值对象，由插件组件自行消费；包装器仅合并透传 */
export type PluginComponentConfig = Record<string, any>;

/**
 * 配置驱动的生命周期绑定：插件在配置文件里声明钩子，
 * 挂载 / 卸载由包装器统一执行，插件侧无需编写组件生命周期代码。
 * 入参为合并后的最终配置（defaults < config 实例注入）。
 */
export interface PluginLifecycleHooks {
  /** 组件挂载后执行（注册全局副作用：监听 / 定时器 / 总线订阅等） */
  onMounted?: (config: PluginComponentConfig) => void;
  /** 组件卸载前执行（清理副作用，与 onMounted 成对声明） */
  onBeforeUnmount?: (config: PluginComponentConfig) => void;
}

/** definePluginComponent 工厂选项 */
export interface DefinePluginComponentOptions {
  /** 包装器组件名（Vue DevTools 显示），默认 Plugin<ComponentName> */
  name?: string;
  /** 默认配置：优先级低于实例 config（合并时实例字段覆盖默认字段） */
  defaults?: PluginComponentConfig;
  /** 工厂级生命周期：与实例级 lifecycle 按序合并执行（工厂级在前） */
  lifecycle?: PluginLifecycleHooks;
}
