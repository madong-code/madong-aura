# CRUD 功能模块开发模板

## 📋 概述

本模板提供了一套完整的 CRUD 功能模块开发规范，适用于当前项目框架（基于 Vue3 + TypeScript + Element Plus + VxeTable）。通过统一的目录结构、命名规范和代码模板，确保项目代码的一致性和可维护性。

## 📁 目录结构规范

### 标准结构（基于当前项目框架）

```
src/apps/{模块名}/
├── api/                   # 模块API接口
├── assets/                # 模块静态资源
├── components/            # 模块私有组件
├── lang/                  # 模块国际化文件
├── mock/                  # 模块模拟数据
├── routes/                # 模块路由配置
├── schemas/               # 模块CRUD配置
└── views/                 # 模块页面视图
    ├── {实体名}/
    │   ├── index.vue      # 页面入口文件
    │   ├── schemas/       # Schema配置
    │   └── components/    # 私有组件（可选）
```

### 核心文件位置

- **页面入口**: `src/apps/{模块名}/views/{实体名}/index.vue`
- **Schema配置**: `src/apps/{模块名}/views/{实体名}/schemas/index.tsx`
- **API服务**: `src/apps/{模块名}/api/{实体名}/index.ts`
- **组件库**: `src/components/crud/`（核心CRUD组件）

### ⚠️ 重要注意事项

- **禁止增加不必要的子目录**，避免目录结构混乱
- 保持目录结构简洁统一
- 模块名使用小写字母，多个单词用连字符分隔
- 实体名使用小写字母，多个单词用连字符分隔
- 文件名统一使用小写字母和连字符
- 目录结构必须严格遵循此规范

## 🔤 命名规范

### 命名规则

- **数据库表名**：使用下划线命名法，如 `system_user`、`system_user_role`
- **模块名**：使用表名中下划线前的部分，如 `system`
- **实体名**：使用表名中下划线后的部分，如 `user`，多个部分用中横线连接，如 `user-role`
- **文件名**：使用中横线命名法，如 `user-role.ts`

### 命名示例

| 表名 | 模块名 | 实体名 | 实体小驼峰名 | API 服务文件 | API 服务类名 |
| --- | --- | --- | --- | --- | --- |
| `system_user` | `system` | `user` | `user` | `./src/app/api/system/user.ts` | `UserService` |
| `system_user_role` | `system` | `user-role` | `userRole` | `./src/app/api/system/user-role.ts` | `UserRoleService` |

## 📏 约束规则

1. **ID字段**：不在列表上显示
2. **列宽度**：默认自适应，无需手动设置
3. **备注字段**：字段过多时不在列表显示
4. **表单布局**：
   - 字段较少时：`colSpan` 默认为 24（全宽）
   - 字段较多时：可设置 `colSpan` 为 12（半宽）

## 🔧 API 服务模板

### 基础服务模板

**文件路径**: `src/apps/{模块名}/api/{实体名}/index.ts`

```typescript
import { BaseService } from '@/utils/request'
import { {EntityName}Row } from '@/apps/{模块名}/api/{实体名}/types'

/**
 * {实体名} API 服务
 */
export const {EntityName}Service = new BaseService<{EntityName}Row>('/{模块名}/{实体名}')

export default {EntityName}Service
```

### BaseService 配置说明

- **baseUrl**: 接口基础路径
- **allowedMethods**: 允许的方法列表（空数组表示允许所有）
- **forbiddenMethods**: 禁止的方法列表（如 `['export']` 表示禁用导出功能）

### 默认包含的接口方法

- `page()`: 分页查询
- `save()`: 新增
- `update()`: 修改
- `remove()`: 删除
- `detail()`: 详情
- `export()`: 导出（可禁用）

## 📋 Schema 配置模板

### 基础配置模板

**文件路径**: `src/apps/{模块名}/views/{实体名}/schemas/index.tsx`

```typescript
import { CrudSchema } from '@/components/crud'
import { {EntityName}Service } from '@/apps/{模块名}/api/{实体名}'
import { $t } from '@/locales'

/**
 * {实体名} CRUD Schema 配置
 */
export const crudSchema = (): CrudSchema => {
  return {
    // 接口配置
    api: {EntityName}Service.page,

    // CRUD API 映射
    crudApi: {
      add: {EntityName}Service.save,
      edit: {EntityName}Service.update,
      remove: {EntityName}Service.remove,
      view: {EntityName}Service.detail
    },

    // 功能开关
    useCrud: true,
    hasAdd: true,
    hasRemove: true,
    hasEdit: true,
    hasView: true,

    // 权限控制
    addAuth: '{模块名}:{实体名}:create',
    removeAuth: '{模块名}:{实体名}:delete',
    editAuth: '{模块名}:{实体名}:update',
    viewAuth: '{模块名}:{实体名}:read',

    // 表格列定义
    columns: [
      // 选择列
      { type: 'selection' },

      // 示例列定义
      {
        prop: 'name',
        label: $t('{模块名}.{实体名}.list.table.columns.name'),
        minWidth: 120
      },

      // 更多列定义...
    ],

    // 搜索表单配置
    searchFormSchema: {
      schema: [
        {
          prop: 'LIKE_name',
          label: $t('{模块名}.{实体名}.list.query.name'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('{模块名}.{实体名}.list.query.placeholder.name')
          },
          colSpan: 6
        }
        // 更多搜索字段...
      ]
    },

    // 弹窗配置
    dialogProps: {
      dialogType: 'drawer',
      width: '50%'
    },

    // 表单配置
    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        // 表单字段定义...
      ]
    }
  }
}
```

### 配置项说明

| 配置项              | 说明               | 默认值  |
| ------------------- | ------------------ | ------- |
| `useCrud`           | 是否启用 CRUD 功能 | `true`  |
| `hasAdd`            | 是否显示新增按钮   | `true`  |
| `hasRemove`         | 是否显示删除按钮   | `true`  |
| `hasEdit`           | 是否显示编辑按钮   | `true`  |
| `hasView`           | 是否显示详情按钮   | `true`  |
| `labelWidth`        | 表单标签宽度       | `100px` |
| `dialogProps.width` | 弹窗宽度           | `50%`   |

## 🖥️ 页面入口模板

### 基础页面模板

**文件路径**: `src/apps/{模块名}/views/{实体名}/index.vue`

```vue
<template>
  <div class="{模块名}-{实体名}-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'

  // 使用 CRUD 组件
  const [BasicCrud] = useCrud(crudSchema())
</script>

<style lang="scss" scoped>
  .{模块名}-{实体名}-page {
    height: 100%;
  }
</style>
```

### 操作按钮配置说明

| 配置项                   | 说明               | 示例               |
| ------------------------ | ------------------ | ------------------ |
| `toolbarActions`         | 表格上方工具栏按钮 | 导出、批量操作等   |
| `dropDownToolbarActions` | 工具栏下拉菜单     | 更多操作           |
| `tableActions`           | 表格行操作按钮     | 编辑、删除、详情等 |
| `dropDownActions`        | 行操作下拉菜单     | 扩展操作           |

## ⚙️ 关键配置说明

### 表格列配置 (columns)

```typescript
{
  prop: '字段名',           // 字段名称
  label: '列标题',          // 列显示标题
  component: '组件名',      // 渲染组件，如 'ApiDict', 'ApiSelect' 等
  componentProps: {         // 组件属性
    code: '字典编码',       // 字典组件特有
    renderType: 'Select'    // 渲染类型
  },
  width: 120,               // 列宽度（可选）
  fixed: 'left'             // 固定列（可选）
}
```

**常用列属性：**

- `type: 'selection'`: 选择列
- `type: 'index'`: 序号列
- `prop`: 数据字段名
- `label`: 列标题
- `component`: 渲染组件
- `width`: 列宽度
- `minWidth`: 最小宽度
- `fixed`: 固定列位置

### 表单字段配置 (formSchema.schema)

```typescript
{
  label: '字段标签',
  prop: '字段名',
  component: '组件名',      // 如 'Input', 'Select', 'ApiDict' 等
  colSpan: 12,             // 栅格占比 (1-24)
  rules: [                 // 校验规则
    {
      required: true,
      message: '校验提示信息'
    }
  ],
  componentProps: {        // 组件属性
    placeholder: '占位符',
    clearable: true
  },
  ifShow(values) {         // 动态显示条件
    return !!values.条件字段
  }
}
```

**常用表单属性：**

- `colSpan`: 栅格宽度（1-24）
- `rules`: 校验规则数组
- `componentProps`: 组件特有属性
- `ifShow`: 条件显示函数
- `show`: 静态显示控制

### 搜索表单配置 (searchFormSchema.schema)

```typescript
{
  prop: '操作符_字段名',     // 如 'LIKE_name', 'EQ_status'
  label: '搜索字段标签',
  component: 'Input',       // 搜索组件
  componentProps: {
    clearable: true,
    placeholder: '请输入搜索条件'
  },
  colSpan: 6               // 栅格占比
}
```

**常用搜索操作符：**

- `EQ_`: 等于
- `LIKE_`: 模糊匹配
- `GT_`: 大于
- `LT_`: 小于
- `IN_`: 包含

### 树形结构配置 (tree)

对于具有树形结构的数据（如菜单、组织架构等），需要配置 tree 属性：

```typescript
export const crudSchema: CrudSchema = {
  // 使用 tree 接口而不是 page 接口
  api: {EntityName}Service.tree,

  // 树型是全量数据，不需要搜索
  useSearchForm: false,

  // 树形结构配置
  tree: {
    id: 'id',              // 树形节点唯一标识字段名
    pid: 'parentId',       // 父节点字段名
    children: 'children'   // 子节点字段名
  },

  // 其他配置...
}
```

**树形配置注意事项：**

- 必须使用 `tree` 接口而非 `page` 接口
- 禁用搜索表单（`useSearchForm: false`）
- 确保 API 返回树形结构数据

## 🧩 常用组件

### 基础表单组件

| 组件            | 说明       | 常用属性                   |
| --------------- | ---------- | -------------------------- |
| `Input`         | 普通输入框 | `placeholder`, `clearable` |
| `InputNumber`   | 数字输入框 | `min`, `max`, `precision`  |
| `Select`        | 下拉选择框 | `options`, `clearable`     |
| `RadioGroup`    | 单选框组   | `options`                  |
| `CheckboxGroup` | 多选框组   | `options`                  |
| `DatePicker`    | 日期选择器 | `type`, `format`           |
| `Divider`       | 分割线     | `content-position`         |

### 异步数据组件

| 组件               | 说明         | 常用属性                          |
| ------------------ | ------------ | --------------------------------- |
| `ApiDict`          | 字典组件     | `code`, `renderType`              |
| `ApiSelect`        | 异步下拉选择 | `api`, `labelField`, `valueField` |
| `ApiCascader`      | 异步级联选择 | `api`, `checkStrictly`            |
| `ApiTreeSelect`    | 异步树形选择 | `api`, `checkStrictly`            |
| `ApiRadioGroup`    | 异步单选框组 | `api`                             |
| `ApiCheckboxGroup` | 异步多选框组 | `api`                             |

### 特殊功能组件

| 组件         | 说明         | 常用属性          |
| ------------ | ------------ | ----------------- |
| `IconPicker` | 图标选择器   | -                 |
| `Editor`     | 富文本编辑器 | -                 |
| `Upload`     | 文件上传组件 | `accept`, `limit` |
| `Avatar`     | 头像上传组件 | `shape`, `size`   |

### ApiDict 组件配置示例

```typescript
{
  label: '状态',
  prop: 'status',
  component: 'ApiDict',
  componentProps: {
    code: 'yes_no',           // 字典编码
    renderType: 'RadioGroup', // 渲染类型：Select/RadioGroup/Checkbox
    isBtn: true               // 按钮样式（RadioGroup特有）
  }
}
```

### ApiSelect 组件配置示例

```typescript
{
  label: '用户',
  prop: 'userId',
  component: 'ApiSelect',
  componentProps: {
    api: '/system/user/select', // 接口地址
    labelField: 'name',         // 显示字段
    valueField: 'id',           // 值字段
    placeholder: '请选择用户'
  }
}
```

## 🔒 权限控制

### 权限码配置

通过以下属性控制功能权限，权限码格式为 `{模块名}:{实体名}:{操作}`：

| 权限属性     | 说明       | 示例                 |
| ------------ | ---------- | -------------------- |
| `addAuth`    | 新增权限码 | `system:user:create` |
| `editAuth`   | 编辑权限码 | `system:user:update` |
| `removeAuth` | 删除权限码 | `system:user:delete` |
| `viewAuth`   | 查看权限码 | `system:user:read`   |

### 权限配置示例

```typescript
export const crudSchema: CrudSchema = {
  // ... 其他配置
  addAuth: 'system:user:create',
  removeAuth: 'system:user:delete',
  editAuth: 'system:user:update',
  viewAuth: 'system:user:read'
  // ...
}
```

## 🔄 CRUD 操作方法

### useCrud 返回方法

通过 `useCrud` 返回的方法可以控制 CRUD 行为：

| 方法              | 说明          | 使用场景       |
| ----------------- | ------------- | -------------- |
| `reload()`        | 刷新表格数据  | 手动刷新       |
| `setState()`      | 设置组件状态  | 动态控制       |
| `removeByApi()`   | 通过 API 删除 | 自定义删除逻辑 |
| `refreshData()`   | 全量刷新数据  | 数据同步       |
| `refreshCreate()` | 新增后刷新    | 新增操作后     |
| `refreshUpdate()` | 更新后刷新    | 编辑操作后     |
| `refreshRemove()` | 删除后刷新    | 删除操作后     |

### 方法使用示例

```typescript
const [BasicCrud, { reload, refreshCreate }] = useCrud({
  // ... 配置
})

// 手动刷新表格
const handleRefresh = () => {
  reload()
}

// 新增后刷新
const handleCreateSuccess = () => {
  refreshCreate()
}
```

## 📚 完整示例

### 示例一：普通表 - 岗位管理 (sys_post)

#### 1. 接口文件

**文件路径：** `src/apps/system/api/post/index.ts`

```typescript
import { BaseService } from '@/utils/request'
import { PostRow } from '@/apps/system/api/post/types'

/**
 * 岗位管理 API 服务
 */
export const PostService = new BaseService<PostRow>('/system/post')

export default PostService
```

#### 2. Schema 配置文件

**文件路径：** `src/apps/system/views/post/schemas/index.tsx`

```typescript
import { CrudSchema } from '@/components/crud'
import { PostService } from '@/apps/system/api/post'
import { $t } from '@/locales'

/** 岗位管理 CRUD 配置 */
export const crudSchema = (): CrudSchema => {
  return {
    // 基础配置
    api: PostService.page,
    dialogTitle: '岗位',

    // API 映射
    crudApi: {
      add: PostService.save,
      edit: PostService.update,
      remove: PostService.remove,
      view: PostService.detail
    },

    // 功能开关
    useCrud: true,
    hasAdd: true,
    hasRemove: true,
    hasEdit: true,
    hasView: true,

    // 权限控制
    addAuth: 'system:post:create',
    removeAuth: 'system:post:delete',
    editAuth: 'system:post:update',
    viewAuth: 'system:post:read',

    // 表格列定义
    columns: [
      { type: 'selection' },
      {
        prop: 'name',
        label: $t('system.post.list.table.columns.name'),
        minWidth: 120
      },
      {
        prop: 'code',
        label: $t('system.post.list.table.columns.code'),
        minWidth: 120
      },
      {
        prop: 'sort',
        label: $t('system.post.list.table.columns.sort'),
        minWidth: 80
      },
      {
        prop: 'enabled',
        label: $t('system.post.list.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: { code: 'yes_no' },
        minWidth: 100
      },
      {
        prop: 'remark',
        label: $t('system.post.list.table.columns.remark'),
        minWidth: 150
      }
    ],

    // 搜索表单
    searchFormSchema: {
      schema: [
        {
          prop: 'LIKE_name',
          label: $t('system.post.list.query.name'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('system.post.list.query.placeholder.name')
          },
          colSpan: 6
        },
        {
          prop: 'EQ_enabled',
          label: $t('system.post.list.query.enabled'),
          component: 'ApiDict',
          componentProps: {
            code: 'yes_no',
            placeholder: $t('system.post.list.query.placeholder.enabled')
          },
          colSpan: 6
        }
      ]
    },

    // 弹窗配置
    dialogProps: {
      dialogType: 'drawer',
      width: '50%'
    },

    // 表单配置
    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('system.post.form.fields.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('system.post.form.fields.name'),
          prop: 'name',
          component: 'Input',
          rules: [{ required: true, message: $t('system.post.form.rules.name.required') }],
          componentProps: {
            placeholder: $t('system.post.form.placeholder.name')
          },
          colSpan: 24
        },
        {
          label: $t('system.post.form.fields.code'),
          prop: 'code',
          component: 'Input',
          rules: [{ required: true, message: $t('system.post.form.rules.code.required') }],
          componentProps: {
            placeholder: $t('system.post.form.placeholder.code')
          },
          colSpan: 24
        },
        {
          label: $t('system.post.form.fields.sort'),
          prop: 'sort',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            placeholder: $t('system.post.form.placeholder.sort')
          },
          colSpan: 24
        },
        {
          label: $t('system.post.form.fields.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          componentProps: {
            code: 'yes_no',
            isBtn: true,
            renderType: 'RadioGroup'
          },
          rules: [{ required: true, message: $t('system.post.form.rules.enabled.required') }],
          colSpan: 24
        },
        {
          label: $t('system.post.form.fields.remark'),
          prop: 'remark',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            placeholder: $t('system.post.form.placeholder.remark')
          },
          colSpan: 24
        }
      ]
    }
  }
}
```

#### 3. 页面入口文件

**文件路径：** `src/apps/system/views/post/index.vue`

```vue
<template>
  <div class="system-post-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'

  // 使用 CRUD 组件
  const [BasicCrud] = useCrud(crudSchema())
</script>

<style lang="scss" scoped>
  .system-post-page {
    height: 100%;
  }
</style>
```

### 示例二：树型表 - 部门管理 (sys_dept)

#### 1. 接口文件

**文件路径：** `src/apps/system/api/dept/index.ts`

```typescript
import { BaseService } from '@/utils/request'
import { DeptRow } from '@/apps/system/api/dept/types'

/**
 * 部门管理 API 服务
 */
export const DeptService = new BaseService<DeptRow>('/system/dept')

// 扩展树形接口
export const getDeptTree = (args?: Record<string, any>) => {
  const params = { ...args, format: 'tree' }
  return DeptService.list<DeptRow[]>(params)
}

export default DeptService
```

#### 2. Schema 配置文件

**文件路径：** `src/apps/system/views/dept/schemas/index.tsx`

```tsx
import { CrudSchema } from '@/components/crud'
import { DeptService, getDeptTree } from '@/apps/system/api/dept'
import { $t } from '@/locales'

/** 部门管理 CRUD 配置 */
export const crudSchema = (): CrudSchema => {
  return {
    // 接口配置：使用 tree 接口以支持树形结构
    api: getDeptTree,

    // CRUD API 映射
    crudApi: {
      add: DeptService.save,
      edit: DeptService.update,
      remove: DeptService.remove,
      view: DeptService.detail
    },

    // 功能开关
    useCrud: true,
    hasAdd: true,
    hasRemove: true,
    hasEdit: true,
    hasView: true,

    // 权限控制
    addAuth: 'system:dept:create',
    removeAuth: 'system:dept:delete',
    editAuth: 'system:dept:update',
    viewAuth: 'system:dept:read',

    // 禁用搜索表单，因为树形结构是全量数据
    useSearchForm: false,

    // 树形结构配置
    tree: {
      id: 'id',
      pid: 'pid',
      children: 'children'
    },

    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'name',
        label: $t('system.dept.list.table.columns.name'),
        component: 'Input',
        minWidth: 150
      },
      {
        prop: 'code',
        label: $t('system.dept.list.table.columns.code'),
        component: 'Input',
        minWidth: 120
      },
      {
        prop: 'sort',
        label: $t('system.dept.list.table.columns.sort'),
        component: 'InputNumber',
        minWidth: 80
      },
      {
        prop: 'enabled',
        label: $t('system.dept.list.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          renderType: 'RadioGroup'
        },
        minWidth: 100
      }
    ],

    searchFormSchema: {
      schema: []
    },

    // 弹窗配置
    dialogProps: {
      dialogType: 'drawer',
      width: '50%'
    },

    // 表单配置
    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('system.dept.form.fields.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('system.dept.form.fields.pid'),
          prop: 'pid',
          component: 'ApiTreeSelect',
          componentProps: {
            api: '/system/dept/tree',
            labelField: 'name',
            valueField: 'id',
            // 任意节点可选
            checkStrictly: true,
            clearable: true,
            placeholder: '请选择父级部门'
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: '请选择父级部门'
            }
          ]
        },
        {
          label: '部门名称',
          prop: 'name',
          component: 'Input',
          componentProps: {
            placeholder: '请输入部门名称'
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: '请输入部门名称'
            }
          ]
        },
        {
          label: '唯一编码',
          prop: 'code',
          component: 'Input',
          componentProps: {
            placeholder: '请输入唯一编码'
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: '请输入唯一编码'
            }
          ]
        },
        {
          label: '排序',
          prop: 'sort',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 9999
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: '请输入排序值'
            }
          ]
        },
        {
          label: '是否启用',
          prop: 'enabled',
          component: 'ApiDict',
          componentProps: {
            code: 'yes_no',
            isBtn: true,
            renderType: 'RadioGroup'
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: '请选择启用状态'
            }
          ]
        },
        {
          label: '部门负责人',
          prop: 'leaderIdList',
          component: 'ApiSelect',
          componentProps: {
            api: '/system/user/select',
            placeholder: '请选择负责人',
            multiple: true
          },
          colSpan: 24
        },
        {
          label: '分管领导',
          prop: 'main_leader_id',
          component: 'ApiSelect',
          componentProps: {
            api: '/system/user/select',
            placeholder: '请选择分管领导'
          },
          colSpan: 24
        },
        {
          label: '备注',
          prop: 'remark',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 3,
            placeholder: '请输入备注'
          },
          colSpan: 24
        }
      ]
    }
  }
}
```

#### 3. 页面入口文件

**文件路径：** `src/apps/system/views/dept/index.vue`

```vue
<template>
  <div class="sys-dept-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'

  const [BasicCrud] = useCrud(crudSchema())
</script>

<style lang="scss" scoped>
  .sys-dept-page {
    height: 100%;
  }
</style>
```
