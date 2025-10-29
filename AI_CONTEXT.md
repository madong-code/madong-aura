## 可复用的 CRUD 功能模块开发模板

### 1. 目录结构模板

注意：别再增加子目录，如madong-art-design/src/，这样子的，你增加后，就会导致目录结构混乱，请勿再增加子目录。

```
src/api/{模块名}/{实体文件名}.ts
src/views/{模块名}/实体文件名
├── index.vue                 # 页面入口文件
├── schemas/
│   └── index.tsx             # CRUD 配置定义
└── components/               # 模块特定组件（可选）
```

**命名规范：**

- 数据库表名：使用下划线命名法，如 `system_user`、`system_user_role`
- 模块名：使用表名中下划线前的部分，如 `system`
- 实体名：使用表名中下划线后的部分，如 `user`，如果有多个部分则用中横线连接，如 `user-role`
- 文件名：使用中横线命名法，如 `user-role.ts`

**约束规则：**

1. id不需要在列表上显示
2. 列表字段宽度不用设置，默认宽度自适应
3. 字段太多时，备注字段不需要在列表显示
4. 如果字段太少，表单`colSpan`默认为24，如果字段太多，可以设置colSpan为12示例：

- 表名 `system_user`
  - 模块名 `system`
  - 实体名 `user`
  - 实体小驼峰名 `user`
  - API 服务文件 `./src/api/system/user.ts`
  - API 服务类名 `UserService`
- 表名 `system_user_role`
  - 模块名 `system`
  - 实体名 `user-role`
  - 实体小驼峰名 `userRole`
  - API 服务文件 `./src/api/system/user-role.ts`
  - API 服务类名 `UserRoleService`

### 2. API 服务模板

创建 `src/api/{模块名}/{实体名}.ts`：

```typescript
import BaseService from '@/api/core/base';
import request from '@/utils/http';
import type { User } from './user-model';


/**
 * 模块路径
 */
const baseUrl = '/system/user';

export const  {EntityName}Service ={
    //默认包含：添加、删除、修改、导出、详情常规接口
    ...BaseService<User>({
      baseUrl,
      allowedMethods: [],
      forbiddenMethods: ['export'],
    }),

   // 扩展接口 - 锁定用户
  lock(data: { id: string | number; reason?: string }) {
    return request.put({ 
      url: `${baseUrl}/locked`, 
      data 
    });
  },

  // 扩展接口 - 解锁用户
  unlock(data: { id: string | number }) {
    return request.put({ 
      url: `${baseUrl}/unlocked`, 
      data 
    });
  },

  // 扩展接口 - 重置密码
  resetPassword(data: { id: string | number; newPassword: string }) {
    return request.put({ 
      url: `${baseUrl}/reset-password`, 
      data 
    });
  },

  // 扩展接口 - 批量操作
  batchLock(ids: (string | number)[]) {
    return request.put({ 
      url: `${baseUrl}/batch-lock`, 
      data: { ids } 
    });
  },

  batchUnlock(ids: (string | number)[]) {
    return request.put({ 
      url: `${baseUrl}/batch-unlock`, 
      data: { ids } 
    });
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
  addAuth: '{模块名}:{实体名}:create',
  // 删除权限码
  removeAuth: '{模块名}:{实体名}:delete',
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
  prop: '操作符_字段名', // 如 'LIKE_name', 'EQ_status'
  label: '搜索字段标签',
  component: 'Input', // 搜索组件
  componentProps: {
    clearable: true,
    placeholder: '请输入搜索条件'
  },
  colSpan: 6 // 栅格占比
}
```

#### 5.4 树形结构配置 (tree)

对于具有树形结构的数据（如菜单、组织架构等），需要配置 tree 属性来启用树形功能：

```typescript
export const crudSchema: CrudSchema = {
  // 使用 tree 接口而不是 page 接口
  api: {EntityName}Service.tree,
  // 树型是全量数据，不需要搜索
  useSearchForm: false,
  // 树形结构配置
  tree: {
    id: 'id',       // 树形节点唯一标识字段名，默认为 'id'
    pid: 'parentId', // 父节点字段名，默认为 'parentId'
    children: 'children' // 子节点字段名，默认为 'children'
  },
  // 其他配置...
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
  - code: 字典编码
  - renderType: 渲染类型(Select/RadioGroup/Checkbox)
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

## 例子

### 普通表-岗位管理(sys_post)

#### 接口文件

`src/api/system/post.ts`

```ts
import request from '@/utils/http'

import BaseService from '@/api/core/base';
import type { PostRow } from './post-model';

const baseUrl = '/system/post';

export const PostService = {
  ...BaseService<PostRow>({ baseUrl }),
};

export default PostService;

```

#### 元数据文件

`src/views/system/post/schemas/index.tsx`

```tsx
import { CrudSchema } from '@/components/crud'
import { PostService } from '@/api/system/post'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: PostService.page,
  dialogTitle: '岗位',
  crudApi: {
    // 新增接口
    add: PostService.create,
    // 修改接口
    edit: PostService.update,
    // 删除接口
    remove: PostService.delete,
    // 详情接口
    view: PostService.get
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
  addAuth: 'system:post:create',
  // 删除权限码
  removeAuth: 'system:post:delete',
  // 修改权限码
  editAuth: 'system:post:update',
  // 详情权限码
  viewAuth: 'system:post:detail',
  // 表格列定义
  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'name',
      label: '岗位名称'
    },
    {
      prop: 'code',
      label: '唯一编码'
    },
    {
      prop: 'sort',
      label: '排序'
    },
    {
      prop: 'enabled',
      label: '是否启用',
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no'
      }
    },
    {
      prop: 'remark',
      label: '备注'
    }
  ],
  // 搜索表单定义
  searchFormSchema: {
    schema: [
      {
        prop: 'LIKE_name',
        label: '岗位名称',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入岗位名称'
        },
        colSpan: 6
      },
      {
        prop: 'EQ_enabled',
        label: '状态',
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          placeholder: '请选择状态'
        },
        colSpan: 6
      }
    ]
  },
  // 内置弹窗配置
  dialogProps: {
    width: '50%'
  },
  // crud表单配置
  formSchema: {
    showDefaultActions: false,
    labelWidth: '100px',
    schema: [
      {
        label: '岗位ID',
        prop: 'id',
        component: 'Input',
        colSpan: 24,
        show: false,
        ifDetail: false
      },
      {
        label: '岗位名称',
        prop: 'name',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入岗位名称'
          }
        ],
        componentProps: {
          placeholder: '请输入岗位名称'
        },
        colSpan: 24
      },
      {
        label: '唯一编码',
        prop: 'code',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入唯一编码'
          }
        ],
        componentProps: {
          placeholder: '请输入唯一编码'
        },
        colSpan: 24
      },
      {
        label: '排序',
        prop: 'sort',
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: '请输入排序值'
        },
        colSpan: 24
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
        rules: [
          {
            required: true,
            message: '请选择是否启用'
          }
        ],
        colSpan: 24
      },
      {
        label: '备注',
        prop: 'remark',
        component: 'Input',
        componentProps: {
          type: 'textarea',
          placeholder: '请输入备注'
        },
        colSpan: 24
      }
    ]
  }
}
```

#### 页面入口文件

`src/views/system/post/schemas/index.tsx`

```vue
<template>
  <div class="system-post-page art-full-height">
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

### 树型表-部门管理(sys_dept)

#### 接口文件

`src/api/systen/dept.ts`

```ts
import BaseService from "@/api/core/base";
import type { DeptRow, DeptTree } from "./dept-model";
import request from '@/utils/http';

const baseUrl = '/system/dept';

export const DeptService = {
  ...BaseService<DeptRow>({ baseUrl }),

  getTree(args?: Record<string, any>): Promise<DeptTree[]> {
    const params = { ...args, format: 'tree' };
    return request.get<DeptTree[]>({ url: baseUrl, params });
  },
};

export default DeptService;

```

#### 元数据文件

`src/views/system/dept/schemas/index.tsx`

```tsx
import { CrudSchema } from '@/components/crud'
import { DeptService } from '@/api/system/dept'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址：改为 tree 接口以支持树形结构
  api: DeptService.tree,
  dialogTitle: '部门',
  crudApi: {
    add: DeptService.create,
    edit: DeptService.update,
    remove: DeptService.delete,
    view: DeptService.get
  },
  useCrud: true,
  hasAdd: true,
  hasRemove: true,
  hasEdit: true,
  hasView: true,
  addAuth: 'system:dept:create',
  removeAuth: 'system:dept:delete',
  editAuth: 'system:dept:update',
  viewAuth: 'system:dept:detail',

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
      label: '部门名称',
      component: 'Input'
    },
    {
      prop: 'code',
      label: '唯一编码',
      component: 'Input'
    },
    {
      prop: 'sort',
      label: '排序',
      component: 'InputNumber'
    },
    {
      prop: 'enabled',
      label: '状态',
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no',
        renderType: 'RadioGroup'
      }
    }
  ],

  searchFormSchema: {
    schema: []
  },

  dialogProps: {
    width: '50%'
  },

  formSchema: {
    showDefaultActions: false,
    labelWidth: '100px',
    schema: [
      {
        label: '部门ID',
        prop: 'id',
        component: 'Input',
        colSpan: 24,
        show: false,
        ifDetail: false
      },
      {
        label: '父级部门',
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
```

#### 页面入口文件

`src/views/system/dept/schemas/index.tsx`

```vue
<template>
  <div class="sys-dept-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'

  const [BasicCrud] = useCrud({
    ...crudSchema,
    toolbarActions: [],
    dropDownToolbarActions: [],
    tableActions: [],
    dropDownActions: []
  })
</script>

<style lang="scss" scoped>
  .sys-dept-page {
    height: 100%;
  }
</style>
```
