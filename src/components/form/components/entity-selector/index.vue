<script lang="ts">
/**
 * EntitySelector 表单注册入口。
 *
 * component-map 自动扫描本目录 index.vue 并以目录名 EntitySelector 登记，
 * 供 VbenForm schema 直接使用：component: 'EntitySelector'。
 * 全部 props / 插槽 / 事件透传至同目录统一调用入口 entity-selector.vue。
 */
import { defineComponent, h, type Component } from 'vue';

import EntitySelector from './entity-selector.vue';

export default defineComponent({
  name: 'EntitySelector',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    // type 由调用方 attrs 提供，此处整体透传，类型上放宽为通用组件
    return () => h(EntitySelector as Component, { ...attrs }, slots);
  },
});
</script>
