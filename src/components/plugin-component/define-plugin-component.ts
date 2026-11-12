/**
 * 插件组件包装器工厂：为插件业务组件生成标准化包装器，
 * 统一完成配置注入、透传适配与生命周期绑定，插件侧零包装代码。
 *
 * 用法：
 * const EquipmentCard = definePluginComponent(EquipmentCardInner, {
 *   name: 'PluginEquipmentCard',
 *   defaults: equipmentCardDefaults,   // 配置文件导出的默认配置
 *   lifecycle: { onMounted, onBeforeUnmount },
 * });
 * // 实例侧再经 componentProps 注入配置即可：
 * // <EquipmentCard :config="{ theme: 'dark' }" :id="row.id" @click="..." />
 */
import { defineComponent, h, type Component } from 'vue';

import PluginComponent from './plugin-component.vue';
import type {
  DefinePluginComponentOptions,
  PluginLifecycleHooks,
} from './types';

function toPascal(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** 工厂级与实例级生命周期按序合并执行（工厂级在前） */
function composeLifecycle(
  ...sources: (PluginLifecycleHooks | undefined)[]
): PluginLifecycleHooks | undefined {
  const hooks = sources.filter(Boolean) as PluginLifecycleHooks[];
  if (hooks.length === 0) return undefined;
  return {
    onMounted: (config) => hooks.forEach((h) => h.onMounted?.(config)),
    onBeforeUnmount: (config) =>
      hooks.forEach((h) => h.onBeforeUnmount?.(config)),
  };
}

export function definePluginComponent(
  component: Component,
  options: DefinePluginComponentOptions = {},
) {
  const { name, defaults, lifecycle } = options;
  const innerName = (component as any)?.name ?? 'Plugin';
  return defineComponent({
    name: name ?? `Plugin${toPascal(innerName)}`,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          PluginComponent,
          {
            ...attrs,
            component,
            configDefaults: defaults,
            // 实例 lifecycle 经 attrs 传入，与工厂级按序合并
            lifecycle: composeLifecycle(
              lifecycle,
              attrs.lifecycle as PluginLifecycleHooks | undefined,
            ),
          },
          slots,
        );
    },
  }) as Component;
}
