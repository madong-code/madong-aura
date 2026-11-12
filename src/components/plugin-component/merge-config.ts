/**
 * 插件配置合并规则（包装器统一适配层，插件侧无需编写任何合并 / 解析代码）：
 * - 普通对象字段递归深合并；
 * - 数组 / 函数 / 基础类型字段整体替换（后传入者优先）；
 * - null / undefined 字段视为「显式覆盖为空」，不回退默认值。
 */
import type { PluginComponentConfig } from './types';

const isPlainObject = (value: any): value is Record<string, any> =>
  Object.prototype.toString.call(value) === '[object Object]';

export function mergePluginConfig(
  base: PluginComponentConfig | undefined,
  override: PluginComponentConfig | undefined,
): PluginComponentConfig {
  const result: Record<string, any> = { ...(base ?? {}) };
  for (const [key, value] of Object.entries(override ?? {})) {
    const prev = result[key];
    result[key] =
      isPlainObject(prev) && isPlainObject(value)
        ? mergePluginConfig(prev, value)
        : value;
  }
  return result;
}
