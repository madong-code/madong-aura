/**
 * 内置选择器配置登记表：统一调用入口按 type 在此取配置。
 * 新增内置选择器：新增 configs/<type>-config.ts 并在此登记一行。
 *
 * 插件/业务模块接入非内置选择器：调用 registerEntityPickerConfig(type, config)
 * 动态注册自定义实体配置，随后 <EntitySelector :type="自定义type"> 即可复用全部外壳
 * （表格选择 / 搜索 / 分页 / 回显 / 只读查看），无需编写外壳代码。
 * 内置类型（user / role / dept / post）受保护，不可被动态注册覆盖。
 */
import type { EntityPickerConfig, EntitySelectorType } from '../core/selector-types';

import { deptPickerConfig } from './dept-config';
import { postPickerConfig } from './post-config';
import { rolePickerConfig } from './role-config';
import { userPickerConfig } from './user-config';

const entityPickerRegistry: Record<EntitySelectorType, EntityPickerConfig> = {
  dept: deptPickerConfig,
  post: postPickerConfig,
  role: rolePickerConfig,
  user: userPickerConfig,
};

/** 动态注册的自定义实体配置（插件/业务模块） */
const customRegistry = new Map<string, EntityPickerConfig>();

/** 已告警过的未知类型，避免重复 console 噪音 */
const warnedTypes = new Set<string>();

/**
 * 动态注册自定义实体选择器配置（插件接入非内置选择器的统一入口）。
 * 注册后 <EntitySelector :type> / EntityPicker / ReadEntitySelector（详情查看）
 * 均可按该 type 使用。内置类型不可覆盖。
 */
export function registerEntityPickerConfig(
  type: string,
  config: EntityPickerConfig,
): void {
  if (type in entityPickerRegistry) {
    console.warn(
      `[EntitySelector] 类型「${type}」为内置选择器，不允许覆盖注册`,
    );
    return;
  }
  if (!config?.fetcher) {
    console.warn(`[EntitySelector] 类型「${type}」注册缺少 fetcher，已忽略`);
    return;
  }
  customRegistry.set(type, config);
}

/** 按 type 取实体配置：内置优先，其次动态注册；未知类型返回 undefined */
export function getEntityPickerConfig(
  type: string,
): EntityPickerConfig | undefined {
  if (type in entityPickerRegistry) {
    return entityPickerRegistry[type as EntitySelectorType];
  }
  const custom = customRegistry.get(type);
  if (!custom && !warnedTypes.has(type)) {
    warnedTypes.add(type);
    console.warn(
      `[EntitySelector] 未找到类型「${type}」的选择器配置，` +
        `请先调用 registerEntityPickerConfig('${type}', config) 注册`,
    );
  }
  return custom;
}

export const entitySelectorTypes = Object.keys(
  entityPickerRegistry,
) as EntitySelectorType[];
