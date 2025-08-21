## 可复用的 CRUD 功能模块开发模板

### 1. 目录结构模板

```
src/api/{模块名}/{实体文件名}.ts
src/views/{模块名}/实体文件名
├── index.vue                 # 页面入口文件
├── schemas/
│   └── index.tsx             # CRUD 配置定义
└── components/               # 模块特定组件（可选）
```

命名规范：

- 数据库表名：使用下划线命名法，如 `sys_user`、`sys_user_role`
- 模块名：使用表名中下划线前的部分，如 `sys`
- 实体名：使用表名中下划线后的部分，如 `user`，如果有多个部分则用中横线连接，如 `user-role`
- 文件名：使用中横线命名法，如 `user-role.ts`

示例：

- 表名 `sys_user`
  - 模块名 `sys`
  - 实体名 `user`
  - API 服务文件 `./src/api/sys/user.ts`
  - API 服务类名 `UserService`
- 表名 `sys_user_role`
  - 模块名 `sys`
  - 实体名 `user-role`
  - API 服务文件 `./src/api/sys/user-role.ts`
  - API 服务类名 `UserRoleService`

### 2. API 服务模板

创建 `src/api/{模块名}/{实体名}.ts`：

```typescript
import request from '@/utils/http'

export class {EntityName}Service {
  // 分页查询
  static page(params: any) {
    return request.post({
      url: '/{模块路径}/{实体名}/page',
      params
    })
  }
  // 树形接口，注意，只有id/name/parentId字段的树形接口才需要此方法
  static tree(params: any) {
    return request.post({
      url: '/{模块路径}/{实体名}/tree',
      params
    })
  }

  // 添加
  static save(params: any) {
    return request.post({
      url: '/{模块路径}/{实体名}/save',
      params
    })
  }

  // 修改
  static update(params: any) {
    return request.post({
      url: '/{模块路径}/{实体名}/update',
      params
    })
  }

  // 删除
  static remove(params: any) {
    return request.post({
      url: '/{模块路径}/{实体名}/remove',
      params
    })
  }

  // 详情
  static detail(params: any) {
    return request.post({
      url: '/{模块路径}/{实体名}/detail',
      params
    })
  }
}
```

### 3. Schema 配置模板

创建 `src/views/{模块名}/schemas/index.tsx`：

```typescript
import { CrudSchema } from '@/components/crud'
import { {EntityName}Service } from '@/api/{模块名}/{实体名}'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: {EntityName}Service.page,
  dialogTitle: '{模块标题}',
  crudApi: {
    // 新增接口
    add: {EntityName}Service.save,
    // 修改接口
    edit: {EntityName}Service.update,
    // 删除接口
    remove: {EntityName}Service.remove,
    // 详情接口
    view: {EntityName}Service.detail
  },
  // 使用crud
  useCrud: true,
  // 是否有新增
  hasAdd: true,
  // 是否有删除
  hasRemove: true,
  // 是否有修改
  hasEdit: true,
  // 是否有详情
  hasView: true,
  // 新增权限码
  addAuth: '{模块名}:{实体名}:save',
  // 删除权限码
  removeAuth: '{模块名}:{实体名}:remove',
  // 修改权限码
  editAuth: '{模块名}:{实体名}:update',
  // 详情权限码
  viewAuth: '{模块名}:{实体名}:detail',
  // 表格列定义
  columns: [
    {
      type: 'selection'
    },
    // 在此处添加表格列定义
  ],
  // 搜索表单定义
  searchFormSchema: {
    schema: [
      // 在此处添加搜索表单字段定义
    ]
  },
  // 内置弹窗配置
  dialogProps: {
    // 需要你根据实际需求来填写弹窗宽度
    width: '50%'
    // dialogType: 'drawer'
  },
  // crud表单配置
  formSchema: {
    showDefaultActions: false,
    // 需要你根据实际需求来填写表单标签宽度
    labelWidth: '100px',
    schema: [
      // 在此处添加表单字段定义
    ]
  }
}
```

### 4. 页面入口模板

创建 `src/views/{模块名}/index.vue`：

```vue
<template>
  <div class="{模块名}-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'

  const [BasicCrud] = useCrud({
    ...crudSchema,
    // 左侧工具栏
    toolbarActions: [],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [],
    // 表格行操作-下拉菜单
    dropDownActions: []
  })
</script>
<style lang="scss" scoped></style>
```

### 5. 关键配置说明

#### 5.1 表格列配置 (columns)

```typescript
{
  prop: '字段名',
  label: '列标题',
  // 可选配置
  component: '组件名', // 如 'ApiDict', 'ApiSelect' 等
  componentProps: {
    // 组件属性
  },
  width: 120, // 列宽度
  fixed: 'left' // 固定列
}
```

#### 5.2 表单字段配置 (formSchema.schema)

```typescript
{
  label: '字段标签',
  prop: '字段名',
  component: '组件名', // 如 'Input', 'Select', 'ApiDict' 等
  colSpan: 12, // 栅格占比 (1-24)
  rules: [
    {
      required: true,
      message: '校验提示信息'
    }
  ],
  componentProps: {
    // 组件属性
    placeholder: '占位符',
    clearable: true
  },
  ifShow(values) {
    // 动态显示条件
    return !!values.条件字段
  }
}
```

#### 5.3 搜索表单配置 (searchFormSchema.schema)

```typescript
{
  prop: 'm_操作符_字段名', // 如 'm_LIKE_name', 'm_EQ_status'
  label: '搜索字段标签',
  component: 'Input', // 搜索组件
  componentProps: {
    clearable: true,
    placeholder: '请输入搜索条件'
  },
  colSpan: 6 // 栅格占比
}
```

### 6. 常用组件

表单组件：

- `Input`: 普通输入框
- `InputNumber`: 数字输入框
- `Select`: 下拉选择框
- `RadioGroup`: 单选框组
- `CheckboxGroup`: 多选框组
- `DatePicker`: 日期选择器
- `ApiDict`: 字典组件（支持Select/Radio/Checkbox渲染）
- `ApiSelect`: 异步下拉选择组件
- `ApiCascader`: 异步级联选择组件
- `ApiTreeSelect`: 异步树形选择组件
- `ApiRadioGroup`: 异步单选框组
- `ApiCheckboxGroup`: 异步多选框组
- `IconPicker`: 图标选择器
- `Editor`: 富文本编辑器
- `Upload`: 文件上传组件
- `Avatar`: 头像上传组件
- `Divider`: 分割线

### 7. 权限控制

通过以下属性控制功能权限：

- addAuth: 新增权限码
- editAuth: 编辑权限码
- removeAuth: 删除权限码
- viewAuth: 查看权限码

### 8. CRUD 操作方法

通过 useCrud 返回的方法可以控制 CRUD 行为：

- reload(): 刷新表格
- setState(): 设置组件状态
- removeByApi(): 通过 API 删除
- refreshData(): 全量刷新
- refreshCreate(): 新增后刷新
- refreshUpdate(): 更新后刷新
- refreshRemove(): 删除后刷新
