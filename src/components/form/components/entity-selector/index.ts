/**
 * 通用「实体选择器包装器」统一出口。
 *
 * 分层：
 * - core/   外壳与契约（selector-shell.vue + selector-types.ts），新增实体时不改；
 * - blocks/ 可选拼装的内容块（搜索栏 / 表格 / 底部分页）；
 * - configs/ 内置实体配置（user / role / dept / post），含部门联动取数与校验约定；
 * - presets/entity-picker.vue 通用配置驱动 preset；
 * - entity-selector.vue 统一调用入口：type + 必要配置即可调用，屏蔽外壳细节。
 *
 * 新增内置选择器：configs/ 加 <type>-config.ts 并在 registry.ts 登记一行；
 * 插件接入非内置选择器：registerEntityPickerConfig(type, config) 动态注册后
 * <EntitySelector :type> 直接复用外壳（见 README §6.7）。
 */
export { default as SelectorFooter } from './blocks/selector-footer.vue';
export { default as SelectorSearchBar } from './blocks/selector-search-bar.vue';
export { default as SelectorTableContent } from './blocks/selector-table-content.vue';
export { default as SelectorTable } from './blocks/selector-table.vue';
export { default as SelectorShell } from './core/selector-shell.vue';
import { createEntityPicker } from './create-picker';

export { resolveEntityApi } from './configs/resolve-api';
export { createEntityPicker } from './create-picker';
export { default as EntitySelector } from './entity-selector.vue';
export { default as EntityPicker } from './presets/entity-picker.vue';

export type {
  EntityFetchContext,
  EntityPickerConfig,
  EntitySelectorType,
  SelectMode,
  SelectorColumn,
  SelectorConfig,
  SelectorDisplay,
  SelectorFetcher,
  SelectorFetchParams,
  SelectorFetchResult,
  SelectorItem,
  SelectorSearchField,
  SelectorSlotProps,
} from './core/selector-types';

import type { EntityPickerConfig } from './core/selector-types';

/**
 * 声明实体选择器配置对象（插件配置文件入口，配置复用机制）：
 * 将 type / columns / fetcher / hydrate 等预定义为独立配置文件导出常量，
 * 导入后整体传入 componentProps.config 即可（见 README §6.7 方式一），
 * 无需调用 registerEntityPickerConfig 预注册。
 */
export function defineEntityConfig<
  T extends Partial<EntityPickerConfig> & { type: string },
>(config: T): T {
  return config;
}

export {
  entitySelectorTypes,
  getEntityPickerConfig,
  registerEntityPickerConfig,
} from './configs/registry';

/** 命名选择器：等价 <EntitySelector type="xxx" />，业务按需取用 */
export const UserPicker = createEntityPicker('user');
export const RolePicker = createEntityPicker('role');
export const DeptPicker = createEntityPicker('dept');
export const PostPicker = createEntityPicker('post');
