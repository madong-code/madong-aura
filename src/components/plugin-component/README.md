# 标准化插件组件包装器模式（Plugin Component Wrapper）实现方案

面向插件（如 MES / ERP / OA 业务模块）的**标准化组件包装器模式**：插件业务组件接入
框架（表单 / 详情 / 通用容器）时，全部接口配置统一经 `componentProps` 直接传入，
包装器层统一完成**配置透传、适配合并与生命周期绑定**；插件侧零解析、零包装代码，
不侵入插件原有业务逻辑，保证可插拔与独立演进。

## 1. 架构与职责边界

```
src/components/plugin-component/
├─ index.ts                    # 统一出口
├─ types.ts                    # 类型契约（见 §3）
├─ merge-config.ts             # 配置合并规则（对象深合并，数组/函数/基础类型整体替换）
├─ define-plugin-config.ts     # definePluginConfig()：独立配置文件声明助手
├─ plugin-component.vue        # 通用包装器核心（配置注入 / 透传适配 / 生命周期绑定）
└─ define-plugin-component.ts  # definePluginComponent()：包装器工厂（预绑定插件组件）
```

| 层 | 职责 | 谁改 |
| --- | --- | --- |
| `plugin-component.vue` | 仅做三件事：①配置合并注入 ②attrs/插槽透传 ③lifecycle 统一绑定 | **不要改**（通用逻辑层） |
| `define-plugin-component.ts` | 为插件组件生成预绑定包装器（defaults / 工厂级 lifecycle） | **不要改** |
| `define-plugin-config.ts` | 配置文件声明助手，仅类型约束 | **不要改** |
| 插件侧 | 内部组件（业务实现）+ 独立配置文件 | **你只写这里** |

职责边界（硬性约束）：

1. 包装器**不解析、不感知任何业务配置字段**——合并后整体 `v-bind` 透传；
2. 插件组件按**原生 props 声明**即可消费配置（Vue props/attrs 正常语义），无接收解析层；
3. 插件与包装层**零耦合**：插件内部组件可脱离包装器独立使用，可插拔。

## 2. 数据流与合并规则

```
componentProps ─┬─ 业务 props / 事件 ──→ attrs 原样透传 ──→ 插件组件
                ├─ config（实例注入，来自配置文件整体传入）
                └─ lifecycle（实例级钩子）
defaults（工厂/包装器侧） ──┐
                            ├─ mergePluginConfig：defaults < config（实例优先）
lifecycle（工厂级） ────────┘   └─ 合并结果 + attrs 一次性 v-bind → 插件组件
```

**合并规则**（`mergePluginConfig`，包装器统一适配，插件无需编写）：

- 普通对象字段递归深合并；
- 数组 / 函数 / 基础类型字段整体替换（后传入者优先）；
- `null` / `undefined` 字段视为显式覆盖为空，不回退默认值。

**生命周期绑定**：插件在配置里声明 `lifecycle.onMounted / onBeforeUnmount`（入参为
合并后的最终配置），挂载 / 卸载由包装器统一执行；工厂级与实例级按序合并执行
（工厂级在前）。插件侧无需编写组件生命周期代码。

## 3. 类型定义规范

```ts
/** 插件组件配置：任意键值对象，由插件组件自行消费；包装器仅合并透传 */
export type PluginComponentConfig = Record<string, any>;

/** 配置驱动的生命周期绑定：包装器统一执行，入参为合并后的最终配置 */
export interface PluginLifecycleHooks {
  onMounted?: (config: PluginComponentConfig) => void;
  onBeforeUnmount?: (config: PluginComponentConfig) => void;
}

/** definePluginComponent 工厂选项 */
export interface DefinePluginComponentOptions {
  name?: string;                          // 包装器组件名（DevTools 显示）
  defaults?: PluginComponentConfig;       // 默认配置，低于实例 config 优先级
  lifecycle?: PluginLifecycleHooks;       // 工厂级生命周期
}
```

## 4. 使用示例

### 4.1 配置文件（插件侧，配置复用机制）

```ts
// src/views/app/plugin/mes/configs/equipment-card.ts
import { definePluginConfig } from '#/components/plugin-component';

export const equipmentCardDefaults = definePluginConfig({
  theme: 'light',
  showFooter: true,
  refreshInterval: 30_000,
});
```

### 4.2 插件内部组件（按原生 props 消费，无解析代码）

```vue
<!-- src/views/app/plugin/mes/components/equipment-card.vue -->
<script setup lang="ts">
// 直接 props 声明即可；配置字段与业务 props 同一通道，无接收/解析层
const props = defineProps<{
  id?: string;
  theme?: 'dark' | 'light';
  showFooter?: boolean;
}>();
</script>
```

### 4.3 工厂生成包装器 + 三种使用方式

```ts
// src/views/app/plugin/mes/components/index.ts
import { definePluginComponent } from '#/components/plugin-component';
import { equipmentCardDefaults } from '../configs/equipment-card';
import EquipmentCardInner from './equipment-card.vue';

/** 配置驱动的副作用（插件自己声明，包装器负责执行时机） */
const cardLifecycle = {
  onMounted: (config) => { /* 启动轮询/订阅，可读 config.refreshInterval */ },
  onBeforeUnmount: (config) => { /* 清理副作用 */ },
};

export const EquipmentCard = definePluginComponent(EquipmentCardInner, {
  name: 'PluginEquipmentCard',
  defaults: equipmentCardDefaults,
  lifecycle: cardLifecycle,
});
```

```vue
<!-- 方式一：模板直接使用，实例 config 覆盖 defaults -->
<EquipmentCard :id="row.id" :config="{ theme: 'dark' }" @refresh="onRefresh" />

<!-- 方式二：VbenForm / 查看器 schema，全部配置经 componentProps 传入 -->
<script setup>
const schema = [
  {
    fieldName: 'equipment_id',
    label: '设备',
    component: 'EntitySelector',
    componentProps: { ...equipmentSelectorConfig, selectMode: 'multiple' },
  },
];
</script>

<!-- 方式三：动态联动 —— 静态配置文件 + 动态值展开合并 -->
<script setup>
const schema = [
  {
    fieldName: 'equipment_id',
    componentProps: (values) => ({
      ...equipmentSelectorConfig,
      deptIds: values.dept_id_list,
      disabled: !(values.dept_id_list ?? []).length,
    }),
  },
];
</script>
```

### 4.4 通用包装器直接使用（不经过工厂）

```vue
<script setup>
import { PluginComponent } from '#/components/plugin-component';
import EquipmentCardInner from '.../equipment-card.vue';
</script>
<template>
  <PluginComponent
    :component="EquipmentCardInner"
    :config-defaults="{ theme: 'light' }"
    :config="{ theme: 'dark' }"
    :lifecycle="{ onMounted: (c) => console.log('mounted', c) }"
  />
</template>
```

## 5. 落地案例：EntitySelector 配置注入

实体选择器已按本模式落地「配置注入」通道（entity-selector README §6.7 方式一）：

1. 插件用 `defineEntityConfig()` 预定义选择器配置（columns / fetcher / hydrate / 部门联动）；
2. 导入后整体传入 `componentProps.config`，**无需**调用 `registerEntityPickerConfig` 预注册；
3. `EntitySelector` 内部按「注册配置 < 注入 config」深合并（注入字段优先）；
4. `fetcher / hydrate` 支持双形态（推荐字符串 API 路径）：标准 CRUD 接口直接传路径
   （列表 `/xxx/list` 自动携带 `page/limit/LIKE_<field>/IN_dept_id`；详情 `'/xxx/:id'`），
   非标准契约传函数，消费边界 `resolveEntityApi` 幂等归一化；
5. 表单 / 搜索 / 详情共用同一 schema：`config` 随 `componentProps` 自动透传至
   ReadEntitySelector，查看器按同一合并与归一化规则完成 id → 名称反查；
6. 动态注册 `registerEntityPickerConfig` 保留为全局共享配置的第二通道。

## 6. 兼容性与注意事项（避坑）

1. **包装器不解析业务字段**：需要新增配置项时，只在插件组件 props 里声明即可，
   无需改包装器任何代码。
2. **合并是深合并但只对普通对象**：`Date / RegExp / Map / Class 实例` 按整体替换处理；
   数组永远整体替换，不做项级合并。
3. **事件透传**：`@xxx` 事件经 attrs 原样透传（`inheritAttrs: false` + `v-bind`），
   插件组件正常 `defineEmits` 即可。
4. **插槽透传**：所有具名插槽原样透传给插件组件，作用域数据不变。
5. **lifecycle 钩子要求成对声明**：`onMounted` 里启动的副作用必须在
   `onBeforeUnmount` 里清理；钩子在组件挂载/卸载时机执行，不能用于渲染期逻辑。
6. **config 引用稳定性**：`mergedConfig` 为 computed，`config` prop 引用变化才重算；
   schema `componentProps(values)` 函数形态每次求值产生新对象属预期行为（依赖字段变更才触发）。
7. **插件可独立运行**：内部组件不 import 包装器任何代码，包装层可随时摘除。
