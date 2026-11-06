# Crud 组件

基于 VxeGrid + VbenForm 的 CRUD 统一封装组件，提供表格、表单、详情等一体化功能。

## 使用方式

### 基础配置

表格配置项直接定义在顶层，无需嵌套：

```vue
<template>
  <Page auto-content-height>
    <BasicCrud />
  </Page>
</template>

<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { useCrud } from '#/adapter/crud';
import type { CrudSchema } from '#/adapter/crud';
import { UserService } from '#/api';

const crudSchemaDef = (): CrudSchema => {
  return {
    crudApi: {
      list: UserService.list,
      add: UserService.create,
      edit: UserService.update,
      remove: UserService.remove,
      view: UserService.get,
    },
    // 表格配置直接定义在顶层
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'system:admin:create',
      edit: 'system:admin:update',
      remove: 'system:admin:delete',
      view: 'system:admin:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      { field: 'id', title: 'ID', minWidth: 60, visible: false },
      { field: 'username', title: '用户名', minWidth: 120 },
      { field: 'email', title: '邮箱', minWidth: 180 },
      { field: 'status', title: '状态', minWidth: 80 },
      { field: 'createdAt', title: '创建时间', minWidth: 160 },
    ],
    searchForm: {
      enabled: true,
      schema: [
        {
          fieldName: 'LIKE_username',
          label: '用户名',
          component: 'Input',
        },
      ],
    },
    formDialog: {
      title: '用户管理',
      width: '500px',
      schema: [
        {
          fieldName: 'id',
          label: 'ID',
          component: 'Input',
          dependencies: { triggerFields: [], show: false },
        },
        {
          fieldName: 'username',
          label: '用户名',
          component: 'Input',
          rules: 'required',
        },
        { fieldName: 'email', label: '邮箱', component: 'Input' },
      ],
    },
  };
};

const [BasicCrud] = useCrud(crudSchemaDef());
</script>
```

## 配置说明

### CrudSchema

```typescript
interface CrudSchema {
  /** CRUD API 接口配置 */
  crudApi: CrudApi;

  /** 搜索表单配置 */
  searchForm?: SearchFormConfig;

  /** 表单弹窗配置 */
  formDialog?: FormDialogConfig;

  // ========== 表格配置项 ==========

  /** 行数据的 key 字段，默认 id */
  rowKey?: string;

  /** 表格列定义 */
  columns?: CrudColumn[] | (() => CrudColumn[]);

  /** 是否显示新增按钮 */
  hasAdd?: boolean;

  /** 是否显示编辑按钮 */
  hasEdit?: boolean;

  /** 是否显示删除按钮 */
  hasRemove?: boolean;

  /** 是否显示详情按钮 */
  hasView?: boolean;

  /** 是否显示批量删除按钮 */
  hasBatchRemove?: boolean;

  /** 操作按钮权限配置 */
  permissions?: TablePermissionConfig;

  /** 请求前处理参数 */
  beforeFetch?: (params: any) => any;

  /** 请求后处理结果 */
  afterFetch?: (res: any) => any;

  /** 表格行操作按钮 */
  tableActions?: ActionItem[];

  /** 表格行下拉操作 */
  dropDownActions?: ActionItem[];

  // ... 其他表格配置项（继承自 TableConfig）
}
```

### formDialog

表单弹窗配置，支持 `modal` 与 `drawer` 两种形态：

```typescript
interface FormDialogConfig {
  /** 是否启用，默认 true */
  enabled?: boolean;
  /** 弹窗标题 */
  title?: string;
  /** 弹窗宽度，Tailwind class，如 'w-[50%]' */
  width?: string;
  /** 弹窗类型，默认 'modal' */
  dialogType?: 'drawer' | 'modal';
  /** 表单内容宽度，默认 'w-1/2' */
  formWidth?: string;
  /** Grid 布局 class，控制表单列数 */
  wrapperClass?: string;
  /** 表单通用配置 */
  commonConfig?: FormDialogCommonConfig;
  /** 是否可拖拽（仅 modal 有效） */
  draggable?: boolean;
  /** 是否显示全屏切换按钮，默认 true（modal 与 drawer 均适用） */
  fullscreenButton?: boolean;
  /** 弹窗组件额外 CSS class，如 'top-0' */
  class?: string;
  /** 弹窗层级，嵌套弹窗时需设更高值 */
  zIndex?: number;
  /** 表单字段配置 */
  schema?: VbenFormSchema[] | (() => VbenFormSchema[]);
  /** 提交前转换表单值 */
  transformFormValues?: (values: Record<string, any>) => Record<string, any>;
  /** 其它配置：api、onSuccess、beforeSubmit、onOpen、confirmText、cancelText */
}
```

**抽屉全屏行为**：

- 全屏状态由 `drawerApi.setState({ fullscreen: true })` 控制，切换用 `setState((prev) => ({ ...prev, fullscreen: !prev.fullscreen }))`。
- 底层 `useVbenDrawer` 的 `fullscreenButton` 默认 `false`，4 个独立业务抽屉外观不变；CRUD 的 `FormDialog` 按 `fullscreenButton !== false` 默认开启，7 个 drawer schema 无需改配置即可全屏。
- 移动端（≤768px）抽屉强制全屏，且不显示全屏/还原切换按钮；桌面端保留单个切换按钮，全屏后点击可还原。
- 关闭全屏按钮：`formDialog: { fullscreenButton: false, ... }`。
- 旧版 `useDialog` 的 `fullscreenButton` 默认 `true`（19 个调用点保持原样），`setState({ fullscreen })` 与 `toggleFullscreen()` 均可驱动全屏。

### permissions

权限配置：

```typescript
permissions: {
  add: 'system:admin:create',
  edit: 'system:admin:update',
  remove: 'system:admin:delete',
  view: 'system:admin:read',
}
```

### dropDownActions

下拉操作按钮配置，支持 Icon：

```typescript
dropDownActions: [
  {
    label: '编辑',
    icon: 'ant-design:edit-outlined',
    auth: 'system:admin:update',
    onClick: ({ row, crudApi }) => {
      crudApi.openEditDialog(row);
    },
  },
  {
    label: '删除',
    icon: 'ant-design:delete-outlined',
    type: 'danger',
    auth: 'system:admin:delete',
    onClick: ({ row, crudApi }) => {
      crudApi.openDeleteConfirm(row);
    },
  },
];
```

### ActionItem

操作按钮配置：

```typescript
interface ActionItem {
  /** 按钮文本 */
  label: string;
  /** 按钮图标 */
  icon?: string;
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** 权限标识 */
  auth?: string;
  /** 是否显示条件 */
  ifShow?: (params: ActionParams) => boolean;
  /** 点击事件 */
  onClick?: (params: ActionParams) => void;
  /** 确认配置 */
  confirm?: {
    title?: string;
    content?: string;
    ok?: () => void;
    cancel?: () => void;
  };
}
```

### dependencies

字段依赖配置：

```typescript
interface Dependencies {
  /** 触发字段 */
  triggerFields?: string[];
  /** 是否显示 */
  show?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 禁用时的值 */
  defaultValue?: any;
}
```

## API 接口定义

```typescript
interface CrudApi {
  /** 列表查询 */
  list: (params: any) => Promise<any>;
  /** 新增 */
  add?: (params: any) => Promise<any>;
  /** 编辑 */
  edit?: (params: any) => Promise<any>;
  /** 单个删除 */
  remove?: (params: any) => Promise<any>;
  /** 批量删除 */
  batchRemove?: (params: { ids: any[] }) => Promise<any>;
  /** 详情 */
  view?: (id: any) => Promise<any>;
}
```

## 特性

- 表格增删改查一体化
- 弹窗表单
- 详情查看
- 行操作按钮
- 下拉操作按钮
- 搜索表单
- 批量操作
- 权限控制
- 字段联动
- 自定义列
- **扁平化配置**：所有表格配置项直接定义在顶层
