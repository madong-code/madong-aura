/**
 * 命名选择器工厂：按类型标识生成专用选择器组件（如 UserPicker），
 * 便于业务在模板中直接以 <UserPicker /> 使用，等价于 <EntitySelector type="user" />。
 */
import { defineComponent, h } from 'vue';

import EntitySelector from './entity-selector.vue';

function toPascal(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * type 接受内置标识或插件经 registerEntityPickerConfig 注册的自定义标识；
 * 未注册类型在 entity-picker 渲染空态兜底，registry 已告警提示注册。
 */
export function createEntityPicker(type: string) {
  return defineComponent({
    name: `EntitySelector_${toPascal(type)}`,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h(EntitySelector, { ...attrs, type }, slots);
    },
  }) as typeof EntitySelector;
}
