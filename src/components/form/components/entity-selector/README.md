# 实体选择器包装器（Selector Wrapper）技术规格

通用「实体选择器包装器」。同一套外壳（`SelectorShell`）复用给所有实体，
内置用户 / 角色 / 部门 / 职位 4 种组织维度选择器，业务模块**只需传类型标识 + 必要配置**即可调用，
完全屏蔽选择器外壳实现细节。面向 ERP / OA / MES 等大量数据类业务场景的高频复用设计。

## 1. 目录结构与架构

```
src/components/form/components/entity-selector/   # component-map 自动扫描注册为 EntitySelector
├─ index.vue                     # 表单注册入口（透传 entity-selector.vue）
├─ index.ts                      # 统一出口（#/components/form/components/entity-selector）
├─ core/                         # 外壳与契约，新增实体时无需改动
│  ├─ selector-shell.vue         # 通用壳：选择模式 / 取数 / 弹层 / 选中态 / 只读态 / 空态
│  └─ selector-types.ts          # 类型契约（见 §3）
├─ blocks/                       # 使用方可拼装的内容块（也可插槽覆盖）
│  ├─ selector-table.vue         # 无状态 VxeGrid 渲染层（行高亮 / 虚拟滚动 / 插槽透传）
│  ├─ selector-table-content.vue # 表格区块（桥接壳透传的单元格插槽）
│  ├─ selector-search-bar.vue    # 搜索栏（single 单字段下拉+关键词 / multi 多字段独立输入，仅按钮/回车触发）
│  └─ selector-footer.vue        # 底部分页 / 清空 / 确认
├─ configs/                      # 内置实体配置（纯 TS，无模板）
│  ├─ dept-tree.ts               # 部门树工具：加载缓存 / 裁剪 / 展平 / 子树 id 收集
│  ├─ user-config.ts             # 用户选择器配置
│  ├─ role-config.ts             # 角色选择器配置
│  ├─ dept-config.ts             # 部门选择器配置（树形取数）
│  ├─ post-config.ts             # 职位选择器配置
│  └─ registry.ts                # 类型标识 → 配置登记表
├─ presets/
│  └─ entity-picker.vue          # 通用配置驱动 preset（配置 → 壳 + 默认 blocks）
├─ entity-selector.vue           # 统一调用入口（type + deptIds 联动 + 强校验）
└─ create-picker.ts              # 命名选择器工厂
```

| 层 | 职责 | 谁改 |
| --- | --- | --- |
| `core/selector-shell.vue` | 选择模式、分页取数、防竞态、弹层、选中态、只读态、`fetchExtra` 透传 | **不要改** |
| `blocks/*` | 搜索栏 / 表格 / 底部分页的默认实现 | 仅在需要不同 UI 时插槽覆盖 |
| `configs/*` | 某实体的列、检索字段、取数、反查、部门联动过滤 | **你只改这里** |
| `entity-selector.vue` | 统一入口与部门联动强校验 | 新内置类型时仅改 registry 登记行 |

表单注册入口：`index.vue`（component-map 自动扫描，目录名 entity-selector → EntitySelector），
适配层登记：`src/adapter/component/index.ts` 的 `ComponentType` / `ComponentPropsMap`。
业务直接导入路径：`#/components/form/components/entity-selector`。

## 2. 统一调用接口

### 2.1 入参（EntitySelector Props）

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | 必填 | 内置标识 `user / role / dept / post`，或插件经 `registerEntityPickerConfig` 动态注册的自定义类型（见 §6.7） |
| `modelValue` | `null \| string \| string[]` | `[]` | 选中 id；单选为 `string`，多选为 `string[]`；兼容逗号分隔串 |
| `selectMode` | `'single' \| 'multiple'` | `'single'` | 选择模式 |
| `display` | `'dialog' \| 'popover'` | `'dialog'` | 弹层形态；搜索筛选场景推荐 `popover` |
| `readonly` | `boolean` | `false` | 只读详情形态：仅渲染已选文案 / 标签，无交互区 |
| `deptIds` | `null \| string \| string[]` | `null` | 强制限定部门（含全部子部门）；支持数组或逗号分隔串 |
| `deptStrict` | `boolean` | `true` | 强校验：`deptIds` 变更时自动清理越界已选并回传 |
| `extraParams` | `Record<string, any>` | — | 其他业务固定参数，透传给取数函数 `params.extra` |
| `disabled` / `placeholder` / `title` / `dialogWidth` | — | — | 同常规表单控件 |

### 2.2 出参（Events）

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `string \| string[]` | v-model；单选空值为 `''`，多选空值为 `[]` |
| `change` | `string \| string[]` | 同 `update:modelValue`，便于业务监听 |

### 2.3 配置项规范（EntityPickerConfig）

业务自定义实体时构造此配置：可经 `defineEntityConfig` 声明为独立配置文件后整体传入
`componentProps.config`（§6.7 方式一），或传入 `EntityPicker`（见 §6.5）：

```ts
interface EntityPickerConfig {
  type: string;                       // 内置或自定义标识
  title: string;
  placeholder?: string;
  columns: SelectorColumn[];          // vxe 列格式，支持 slots.default
  searchFields: SelectorSearchField[];// { label, value }，value 即 LIKE_ 前缀的字段名
  /** 取数双形态（推荐字符串）：
   * - 字符串：标准 CRUD 列表接口路径，GET + { page, limit, LIKE_<field>, IN_dept_id }，
   *   响应 { items, total }（非分页接口返回数组亦可）；
   * - 函数(params, ctx)：非标准契约（参数组装 / 多接口聚合 / 自定义过滤）。
   * 字符串形态由 resolveEntityApi 在消费边界归一化为函数（幂等）。 */
  fetcher: SelectorFetcher | string;
  /** 反查双形态（推荐字符串）：
   * - 字符串：标准 REST 详情路径模板 '/xxx/:id'（占位替换）或 '/xxx'（末尾拼接 id），
   *   响应实体行，失败返回 null（回显回退原 id，联动校验保留原值）；
   * - 函数(id)：自定义反查。 */
  hydrate?: EntityHydrate;
  /** 搜索模式：single 单字段下拉 + 关键词（默认）/ multi 多字段独立输入（非空条件 AND 下发） */
  searchMode?: 'single' | 'multi';
  labelOf?(row: any): string;         // 选中后展示文案
  rowKey?: string;                    // 默认 'id'
  deptField?: string;                 // 部门外键字段名；声明后参与部门联动强校验
}

// 取数入参
interface SelectorFetchParams {
  page: number; limit: number;
  keyword: string;                    // 已 trim，指向当前活动字段（向后兼容单字段模式）
  field: string;                      // 当前检索字段
  filters?: Record<string, string>;   // 多字段非空条件（field → 关键词，AND 下发）；旧 fetcher 无需感知
  extra?: Record<string, any>;        // 统一入口透传的业务固定参数
}
// 取数上下文（统一入口注入）
interface EntityFetchContext {
  deptIds: string[];                  // 限定部门 id 集合（已展开全部子部门），空 = 不限
  deptRootIds: string[];              // 使用方原始传入范围
}
```

## 3. 内置 4 种选择器

| type | 数据源 | 取数方式 | 检索字段 | 展示列 | 参与部门联动 |
| --- | --- | --- | --- | --- | --- |
| `user` | `UserService`（`/system/admin`） | 服务端分页 | 姓名 / 账号 / 手机号 | 姓名、账号、手机号 | 是（`dept_id`） |
| `role` | `RoleService`（`/system/role`） | 服务端分页 | 名称 / 编码 | 角色名称、编码 | 否 |
| `dept` | `DeptService.getTree()` | 树裁剪 + 客户端过滤分页 | 名称 / 编码 | 部门名称（层级缩进）、编码 | 是（自身 `id`） |
| `post` | `PostService`（`/system/post`） | 服务端分页 | 名称 / 编码 | 职位名称、编码 | 是（`dept_id`） |

后端过滤约定（通用 CRUD）：`LIKE_<field>`（模糊）、`EQ_<field>`（精确）、
`IN_<field>`（**必须传数组**，axios 自动序列化为 `IN_dept_id[]=`）。
新增内置选择器：`configs/<type>-config.ts` 定义配置 → `registry.ts` 登记一行。

## 4. 部门联动机制（强制限定）

场景：表单同时存在「上级部门」与「部门 / 职位 / 人员」字段，上级变更时下级可选数据必须联动收敛。

实现逻辑（`entity-selector.vue`）：

1. **范围解析**：`deptIds` → 规范化为 id 数组 → `loadDeptTree()`（模块级缓存 TTL 60s）→
   `collectSubtreeIds()` 展开为「根 + 全部子部门」id 集合（`resolvedDeptIds`）；
   树加载失败时退化为原始传入范围，不阻塞选择。
2. **可选数据过滤**：`resolvedDeptIds` 经 `fetchExtra` 注入壳的取数参数 `extra`：
   - `dept`：取数前按根集合 `pruneTree()` 裁剪树，仅限定子树可被选中；
   - `post` / `user`：取数携带 `IN_dept_id`（数组），服务端过滤；
   - `role`：不声明 `deptField`，不受影响。
3. **已选值强校验（`deptStrict`，默认开启）**：`deptIds` / `modelValue` 变化时逐一校验已选 id——
   `dept` 检查 id 本身、`post` / `user` 经 `hydrate` 反查行数据检查 `dept_id`
   （反查结果带缓存；反查失败保留原值，避免网络抖动误删数据）；
   越界项自动清理并回传新值，同时提示「已按部门限定范围自动移除 N 个超出范围的已选项」。
4. **前置条件解除（非空 → 空）**：`deptStrict` 开启时，`deptIds` 从有值变为空（如清空了部门）
   视为前置条件消失，自动清空关联已选值并提示，避免禁用态残留脏数据。
5. **前置条件禁用**：组件本身不隐式禁用；依赖字段在 schema `componentProps(values)` 中按
   前置字段是否已选计算 `disabled` + `placeholder`（如「请先选择部门」），见 §6.3。
6. **实时性**：面板打开状态下 `deptIds` 变更立即重取列表；关闭状态下下次打开生效。
7. **弹窗交互**：dialog 形态使用框架封装弹窗（`#/components/dialog`，与 CRUD 弹窗风格统一）：
   header 右上角自带 **全屏 / 还原 / 关闭** 按钮，底部为 **取消 / 确定** 栏；可拖拽；
   触发区已选标签点击 × 可移除（单选即清空）；树表格行高亮经「内部 rowid ↔ 业务 id」
   映射比对，展开/收起/滚动后均保持正确。

> 部门数据后台变更后，可调用 `invalidateDeptTreeCache()` 强制刷新联动树缓存。

## 5. 三大使用场景适配

| 场景 | 用法 | 关键配置 |
| --- | --- | --- |
| 表单字段 | `component: 'EntitySelector'`（VbenForm schema）或模板 `<EntitySelector />` | 默认 `display: 'dialog'`；单根节点兼容 VbenForm attrs 注入 |
| 搜索表单筛选条件 | 搜索表单 schema 同上；或模板 `display="popover"` | `multiple: true` + `popover` 紧凑形态；触发区可直接输关键词 |
| 只读详情 | `readonly` | 仅渲染已选文案（单选文本 / 多选标签），无弹层与交互 |

## 6. 调用示例

### 6.1 模板内使用（统一入口）

```vue
<script setup lang="ts">
import { EntitySelector } from '#/components/form/components/entity-selector';
import { ref } from 'vue';

const userId = ref('');
const deptIds = ref<string[]>([]);
const postIds = ref<string[]>([]);
</script>

<template>
  <!-- 基础：单选用户 -->
  <EntitySelector v-model="userId" type="user" />

  <!-- 多选角色，弹窗形态 -->
  <EntitySelector v-model="roleIds" type="role" select-mode="multiple" />

  <!-- 部门联动：选中部门后，职位仅该部门（含子部门）下可选 -->
  <EntitySelector v-model="deptIds" type="dept" select-mode="multiple" />
  <EntitySelector
    v-model="postIds"
    type="post"
    select-mode="multiple"
    :dept-ids="deptIds"
    dept-strict
  />
</template>
```

### 6.2 命名选择器（工厂生成的专用组件）

```ts
import { DeptPicker, PostPicker, RolePicker, UserPicker } from '#/components/form/components/entity-selector';
// <UserPicker v-model="userId" /> 等价 <EntitySelector type="user" v-model="userId" />
```

### 6.3 VbenForm schema（表单字段 / 搜索表单通用）

```ts
// 搜索表单：多选 + popover 紧凑筛选
const schema = [
  { fieldName: 'dept_id', component: 'EntitySelector', label: '部门' },
  {
    fieldName: 'user_ids',
    component: 'EntitySelector',
    label: '责任人',
    componentProps: { type: 'user', selectMode: 'multiple', display: 'popover' },
  },
];

// 部门联动 + 前置条件禁用（componentProps(values) 随值动态重算）
const schema = [
  { fieldName: 'dept_id_list', component: 'EntitySelector', label: '部门',
    componentProps: { type: 'dept', selectMode: 'multiple' } },
  {
    fieldName: 'post_id_list',
    component: 'EntitySelector',
    label: '岗位',
    componentProps: (values) => {
      const deptIds = values.dept_id_list ?? [];
      return {
        type: 'post',
        selectMode: 'multiple',
        deptIds,
        disabled: deptIds.length === 0,
        placeholder: deptIds.length > 0 ? '选择职位' : '请先选择所属部门',
      };
    },
  },
];
// deptStrict（默认开）保证：部门变更自动清理越界已选、部门清空自动清空关联已选
```

### 6.4 只读详情

```vue
<EntitySelector v-model="form.dept_id" type="dept" readonly />
```

### 6.5 自定义实体复用外壳（新增业务实体）

```ts
import { EntityPicker } from '#/components/form/components/entity-selector';
// config 构造见 §2.3；fetcher 自行拼参数（LIKE_/EQ_/IN_ + page/limit）
<EntityPicker :config="myConfig" v-model="id" select-mode="multiple" />
```

### 6.6 命令式取数上下文

业务侧无需直接构造 `deptIds` 子树集合；统一入口已展开全部子部门。
仅当需要其他业务固定参数时使用 `extraParams`：

```vue
<EntitySelector
  v-model="userId"
  type="user"
  :dept-ids="deptIds"
  :extra-params="{ enabled: 1 }"
/>
```

### 6.7 插件接入非内置选择器（标准化包装器模式）

插件/业务模块的实体（如 MES 设备、工单、工艺路线）无需改框架代码即可复用全部外壳
（表格选择 / 搜索 / 分页 / 回显 / 部门联动 / 只读查看）。提供两种接入通道，
**优先使用方式一（配置注入）**：所有接口配置统一经 `componentProps` 直接传入，
包装器层完成合并、透传与生命周期绑定，插件侧零解析代码。

#### 方式一：配置注入（推荐，componentProps 直接传配置对象）

**第一步：声明独立配置文件**（配置复用机制：大配置项预定义为导出常量，多处导入复用）：

```ts
// 插件模块内，如 src/views/app/plugin/mes/configs/equipment-selector.ts
import { defineEntityConfig } from '#/components/form/components/entity-selector';
import { requestClient } from '#/api/request';

export const equipmentSelectorConfig = defineEntityConfig({
  type: 'equipment',                 // 自定义标识，不可与内置 user/role/dept/post 重名
  title: '选择设备',
  placeholder: '选择设备',
  rowKey: 'id',
  labelOf: (row) => row?.name ?? '', // 选中后触发区展示文案
  deptField: 'dept_id',              // 可选：声明后参与部门联动强校验（deptIds 限定/清理）
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'name', title: '设备名称', minWidth: 160 },
    { field: 'code', title: '设备编码', minWidth: 120 },
  ],
  searchFields: [
    { label: '设备名称', value: 'LIKE_name' },
    { label: '设备编码', value: 'LIKE_code' },
  ],
  // 取数（推荐字符串形态）：标准 CRUD 列表接口直接传路径；组件边界自动归一化，
  // 携带 { page, limit, LIKE_<field>, IN_dept_id }，响应 { items, total } / 数组均可
  fetcher: '/mes/equipment/list',
  // 反查（推荐字符串形态）：标准 REST 详情路径模板，':id' 占位替换或末尾拼接 id；
  // 编辑回显 / 只读详情文案 / 部门联动强校验使用；失败返回 null 回退原 id
  hydrate: '/mes/equipment/:id',
});
```

**fetcher / hydrate 双形态与推荐方案**：

| 形态 | 适用 | 说明 |
| --- | --- | --- |
| 字符串 API 路径（**推荐**） | 标准 CRUD 契约接口 | 配置文件保持纯数据（可序列化、易复用、零样板代码）；列表传路径（自动携带 `page/limit/LIKE_<field>/IN_dept_id`，响应 `{ items, total }` 或数组）；详情传 `'/xxx/:id'` 或 `'/xxx'`（失败返回 null 回退原 id） |
| 函数 | 非标准契约 | 参数组装、多接口聚合、前端过滤、响应结构非标准时使用；`fetcher(params, ctx)` / `hydrate(id)` |
| 混合 | 部分标准 | `fetcher` 字符串 + `hydrate` 函数（或反之）均可，归一化按字段独立处理（幂等） |

```ts
// 函数形态兜底示例（非标准契约时）：
fetcher: async (params, ctx) => {
  const { page, limit, keyword, field } = params;
  const res: any = await requestClient.get('/mes/equipment/list', {
    params: { page, limit, ...(keyword ? { [field]: keyword } : {}) },
  });
  return { items: res?.items ?? [], total: Number(res?.total ?? 0) };
},
hydrate: async (id) => {
  try {
    return await requestClient.get(`/mes/equipment/${id}`);
  } catch {
    return null;
  }
},
```
```

**第二步：导入后整体传入 `componentProps.config`**（无需预注册，表单 / 搜索 / 详情共用同一 schema）：

```ts
import { equipmentSelectorConfig } from '#/views/app/plugin/mes/configs/equipment-selector';

const schema = [
  {
    fieldName: 'equipment_id',
    label: '设备',
    component: 'EntitySelector',
    // 配置对象整体注入 config prop；与动态联动值合并时仅展开动态部分：
    componentProps: (values) => ({
      config: equipmentSelectorConfig,
      selectMode: 'multiple',
      deptIds: values.dept_id_list,
    }),
  },
];
```

包装器内部按「注册配置 < 注入 config」深合并（注入字段优先），同 type 的注册配置可被
注入字段局部覆盖；编辑与查看共用 schema 时，`config` 随 `componentProps` 自动透传给
ReadEntitySelector，查看器按同一合并规则取得 `hydrate / labelOf` 完成 id → 名称反查。

#### 方式二：动态注册（全局共享配置）

适用于配置不便于随 componentProps 携带的场景（多模块共享同一配置、第三方动态调用等）：
在插件入口（bootstrap）调用一次 `registerEntityPickerConfig(type, config)`，配置对象构造同方式一。
规则：
- 注册需发生在首次使用该 type 之前（建议插件模块 bootstrap / 入口文件同步执行）；
- 内置类型 `user / role / dept / post` 受保护，覆盖注册会被忽略并告警；
- 缺少 `fetcher` 的注册配置会被忽略并告警。

**两种方式使用侧完全一致**（三大场景全兼容）：

```vue
<!-- 表单字段 / 命名工厂均可 -->
<EntitySelector v-model="form.equipment_id" type="equipment" />
<!-- 多选 + popover 搜索筛选 -->
<EntitySelector v-model="query.equipment_ids" type="equipment" select-mode="multiple" display="popover" />
```

```ts
// 工厂命名选择器同样支持自定义 type
import { createEntityPicker } from '#/components/form/components/entity-selector';
export const EquipmentPicker = createEntityPicker('equipment');
```

> 方式二未注册 / 方式一未注入时调用 `<EntitySelector type="xxx" />` 不会崩溃：
> 渲染空态兜底，并 console.warn 提示接入方法。
> 通用包装器模式（任意插件业务组件的配置注入 / 生命周期绑定）见
> `#/components/plugin-component`（其 README 含完整类型规范与示例）。

## 7. 兼容性与性能要求

### 兼容性

1. **v-model 归一化**：单选 `''`、多选 `[]` 为空值约定；`string` / `string[]` / 逗号分隔串均可回填；
   外部值变化（表单重置）自动同步，自身 emit 引起的回写跳过。
2. **表单适配**：单根容器，兼容 VbenForm 注入 `name` / `onBlur` 等 attrs；
   经 `component-map` 自动扫描注册为 `EntitySelector`，schema 直接可用。
3. **Element Plus 按需导入**：所有 EP 组件显式 `import`，不全局注册。
4. **后端契约**：仅依赖通用 CRUD 的 `list` 接口与 `LIKE_/EQ_/IN_` 过滤前缀 + `page/limit` 分页；
   `IN_` 必须传数组。未就绪的后端按约定字段写 stub，接口上线无需改代码。
5. **插件复用**：MES 等插件的 `components/selector` 保留独立演进；插件新业务应优先引用框架版
   `#/components/form/components/entity-selector`。非内置实体经 `registerEntityPickerConfig`
   动态注册接入（见 §6.7），无需改框架代码；MES 移植方法：把其 preset 的取数改为自定义 `EntityPickerConfig`。

### 性能优化（对齐 ERP/OA/MES 大数据量场景）

1. **服务端分页**：`user` / `role` / `post` 全部服务端分页（默认 20 条/页），避免全量拉取。
2. **防竞态**：壳内 `requestSeq` 只渲染最后一次响应；快速翻页不串数据。
3. **搜索不自动触发**：输入与切换字段仅回写状态，点「搜索」才取数；popover 触发区输入经 300ms 防抖。
4. **行高亮零重渲染**：选中/取消仅切换行 DOM class（命令式 `setHighlight`），不走 `rowClassName`，
   状态列等插槽单元格不因选中闪烁。
5. **稳定对象引用**：`scroll-y` 等常量保持稳定引用，避免每次渲染造表格重绘。
6. **部门树缓存**：树数据 TTL 60s 模块级缓存；联动多次触发不重复请求；`dept` 选择器客户端分页
   （组织树量级通常 < 数千节点）。
7. **联动反查缓存**：`deptStrict` 校验的 `hydrate` 结果按 id 缓存，`deptIds` 频繁变更不产生请求风暴。
8. **虚拟滚动**：表格层支持 `scroll-y` 虚拟滚动（已默认 `{ enabled: true, gt: 0 }`），大数据面板可扩展。

## 8. 注意事项（避坑）

1. **壳不可改**：通用逻辑都在 `core/selector-shell.vue`；不同交互优先插槽覆盖 `blocks/*`。
2. **`IN_` 传数组**：`IN_dept_id: ['1','2']`，传字符串会被后端忽略。
3. **`hydrate` 尽量提供**：只读详情 / 编辑回显仅有 id 时依赖反查补齐文案；联动强校验也依赖它。
4. **联动是幂等的**：`deptStrict` 清理只回传必要变更（无越界项不 emit），不会与表单回写形成死循环。
5. **空态文案**：有关键词时提示调整检索，无关键词时提示输入检索。
6. **多字段搜索（`searchMode: 'multi'`）**：每个 `searchField` 独立输入框，
   非空条件经 `params.filters`（field → 关键词）**AND 语义**一起下发；
   字符串 fetcher 自动逐字段 `LIKE_<field>`；仅按 `keyword/field` 取数的旧函数 fetcher
   零改动兼容（single 模式行为完全不变）。
