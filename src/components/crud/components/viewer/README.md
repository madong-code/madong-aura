# 详情查看器（viewer）

CRUD 详情查看（只读）场景的统一渲染体系：复用表单 schema，按字段自动匹配查看器组件，内置多类型格式化与全状态兜底。

## 一、组件清单

| 组件 | 说明 |
| --- | --- |
| `DetailViewer`（viewer.vue） | 详情查看主组件，逐字段渲染 |
| `ViewerItemBoundary` | 单项渲染异常边界（内部使用，异常字段回退 `--`，页面不崩溃） |
| `ReadText` / `ReadTextArea` / `ReadDatePicker` / `ReadApiSelectDept` 等 23+ | 各类型查看器（component-map 自动扫描 `components/**/index.vue` 注册为 `Read<Name>`） |
| `ReadAmount` / `ReadEnum` / `ReadDate` / `ReadEntitySelector`（本次新增） | 金额 / 枚举（Tag）/ 日期 / 实体 id→名称反查（dept/post/role/user 经 config.hydrate） |

## 二、统一入参接口规范

所有查看器组件必须兼容 `ViewerCommonProps`（[types.ts](./types.ts)）：

```ts
interface ViewerCommonProps {
  value: any;             // 字段值（唯一数据来源）
  fieldName?: string;     // 所属字段名
  schema?: VbenFormSchema; // 当前字段完整 schema
  data?: Record<string, any>; // 整行数据（跨字段联动）
}
```

- **空值约定**：null / undefined / '' / 空数组 一律渲染 `--`，判断统一用 `isEmptyValue`
- **样式约定**：根类名 `reader-<name>`；空值占位类名 `empty-value`；颜色只用 Element Plus CSS 变量
- **状态约定**：异步取数组件（api-*）自带 loading / error 兜底，禁止未捕获异常
- **事件约定**：只读组件，除 `copy`（复制成功）外不约定事件

## 三、多类型自动格式化

无对应查看器组件的字段，`DetailViewer` 按 `format` 声明自动格式化（[format.ts](./format.ts)，纯函数、永不抛异常）：

```ts
// schema 上声明格式化
{ fieldName: 'salary', label: '薪资', component: 'Input',
  componentProps: { format: { type: 'amount', prefix: '¥', precision: 2 } } }

// 支持的类型
type ViewerFormatType = 'amount' | 'date' | 'datetime' | 'enum' | 'json' | 'text';
```

| 类型 | 规则 |
| --- | --- |
| `amount` | 千分位 + precision 精度 + prefix/suffix；非数值原样展示 |
| `date` / `datetime` | Date / 秒与毫秒时间戳自适配 / ISO 串；非法输入 `--` |
| `enum` | options 数组或键值对象映射；未命中回退原值 |
| `text` | 数组自动拼接、对象自动 JSON、超长截断（textLimit） |
| `json` | 安全序列化（循环引用/BigInt 不抛错） |

## 四、全状态兜底

| 状态 | 兜底方式 |
| --- | --- |
| 空数据 | 所有查看器 `isEmptyValue` → `--`；主组件 fallback 同规则 |
| 加载中 | `DetailViewer` 传 `loading` → 顶层"加载中"兜底；api-* 组件内部自带 loading |
| 渲染异常 | `ViewerItemBoundary` 逐字段捕获，仅异常项显示 `--` 并 console 提示，页面整体不崩溃 |

## 五、使用示例

```vue
<script setup lang="ts">
import { DetailViewer } from '#/components/crud/components/viewer';
import type { DetailViewerProps } from '#/components/crud/components/viewer';
import type { VbenFormSchema } from '#/adapter/form';

const props = defineProps<{ model?: Record<string, any>; loading?: boolean }>();

// 常规数据 + 特殊格式数据
const schema: VbenFormSchema[] = [
  { fieldName: 'username', label: '账号', component: 'Input' },
  { fieldName: 'dept_id_list', label: '所属部门', component: 'ApiSelectDept' },
  // 日期（时间戳/ISO 串均可）
  { fieldName: 'created_at', label: '创建时间', component: 'Input',
    componentProps: { format: { type: 'datetime' } } },
  // 金额
  { fieldName: 'salary', label: '薪资', component: 'Input',
    componentProps: { format: { type: 'amount', prefix: '¥', precision: 2 } } },
  // 枚举（数组配置）
  { fieldName: 'status', label: '状态', component: 'Input',
    componentProps: { format: {
      type: 'enum',
      enum: [
        { label: '启用', value: 1, color: 'success' },
        { label: '禁用', value: 0, color: 'danger' },
      ],
    } } },
  // 长文本（超 100 字符截断 + title 提示）
  { fieldName: 'remark', label: '备注', component: 'TextArea',
    componentProps: { format: { type: 'text', textLimit: 100 } } },
];
</script>

<template>
  <!-- loading / model 为空 / 字段缺失 / 值异常 时均安全展示，不空白不报错 -->
  <DetailViewer :model="props.model" :schema="schema" :loading="props.loading" />
</template>
```

### 直接使用格式化工具

```ts
import {
  formatAmountValue, formatDateValue, formatEnumValue,
  formatViewerValue, isEmptyValue,
} from '#/components/crud/components/viewer';

formatViewerValue(1234567.89, { format: 'amount' }); // '1,234,567.89'
formatViewerValue(1794406707, { format: 'datetime' }); // 自动识别秒级时间戳
isEmptyValue(undefined); // true
```

### 兼容性测试结论（format.test.ts，42 用例全过）

| 场景 | 表现 |
| --- | --- |
| 空数据（null/undefined/''/[]） | 统一 `--` |
| 异常格式（'abc'、'2026-13-45'、NaN、Infinity、循环引用对象） | 金额原样展示 / 日期回退 `--` / JSON 不抛错 |
| 缺失字段 | `resolveValue` 回退 undefined → `--` |
| 大数据量（万级长文本、5000 条雪花 id 串） | 截断展示 / 拼接正常，无卡死 |
| epoch 0 / boolean 等错乱输入 | 拦截为 `--`，不显示 1970 时间 |

## 六、迁移说明（存量查看器组件）

存量组件已天然符合隐式约定（空值 `--`、根类名 `reader-*`），无需立即改造；新增组件请直接使用 `ViewerCommonProps` 类型与 `format.ts` 工具，并遵循第二节规范。
