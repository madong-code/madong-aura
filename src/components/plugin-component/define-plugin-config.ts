/**
 * 插件配置文件声明助手（配置复用机制入口）。
 *
 * 插件承载大量配置项时，将配置预先定义为独立配置文件导出的常量：
 * import { definePluginConfig } from '#/components/plugin-component';
 * export const equipmentConfig = definePluginConfig({ type: 'equipment', ... });
 * 导入后整体传入 componentProps.config 或作为 definePluginComponent 的 defaults。
 * 仅提供类型约束与配置常量语义，不做任何运行时处理。
 */
import type { PluginComponentConfig } from './types';

export function definePluginConfig<T extends PluginComponentConfig>(
  config: T,
): T {
  return config;
}
