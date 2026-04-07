# Madong 管理系统多语言 (i18n) 完整指南

## 📖 概述

Madong 管理系统采用 `vue-i18n` 作为国际化解决方案，支持中英文双语切换。本指南包含系统架构、使用示例、最佳实践和常见问题。

## 🚀 快速开始

### 1. 导入翻译函数
```typescript
import { $t } from '@/locales'
```

### 2. 在Vue模板中使用
```vue
<template>
  <h1>{{ $t('system.title') }}</h1>
  <button>{{ $t('common.button.save') }}</button>
</template>
```

### 3. 在TypeScript中使用
```typescript
const title = $t('system.user.title')
const message = $t('message.welcome', { name: '张三' })
```

## 📁 系统架构

### 目录结构
```
admin/src/locales/
├── index.ts              # 多语言核心配置和加载器
├── lang/                 # 语言包根目录
│   ├── zh-cn/           # 中文语言包
│   │   ├── common.json  # 通用词汇
│   │   ├── zh.json      # 根级配置
│   │   ├── system.json  # 系统模块
│   │   └── [module]/    # 模块子目录
│   └── en/              # 英文语言包（结构同中文）
└── *.md                 # 文档文件
```

### 语言包加载优先级
1. **当前目录 lang** (`./lang/`) - **最高优先级**
2. **上层目录 lang** (`../lang/`) - **高优先级**
3. **Apps模块 lang** (`../apps/**/lang/`) - **中等优先级**

**注意**：后加载的同名key会覆盖先加载的。

## 🔧 核心功能

| 功能 | 说明 | 示例 |
|------|------|------|
| ✅ 双语支持 | 中文 (zh)、英文 (en) | `locale.value = 'en'` |
| ✅ 模块化加载 | 支持多层目录结构 | `lang/zh-cn/system/user.json` |
| ✅ 优先级控制 | 支持不同来源的覆盖 | App模块可覆盖基础配置 |
| ✅ 嵌套命名空间 | 支持点分隔符组织 | `system.user.title` |
| ✅ 扁平化转换 | 自动转换扁平JSON为嵌套对象 | 见下文JSON格式 |
| ✅ 参数化翻译 | 支持动态参数替换 | `{name}` |
| ✅ 持久化存储 | 语言设置自动保存 | localStorage |

## 📝 使用示例

### 基础翻译
```typescript
// 简单翻译
$t('common.button.save')           // "保存" 或 "Save"

// 带参数翻译
$t('message.welcome', { name: '张三' })  // "欢迎, 张三!"

// 带复数处理
$t('message.search.result', { count: 25 }) // "找到 25 条结果"
```

### 表格列配置（解决你的具体问题）
```typescript
{
  prop: 'access',
  label: $t('system.project.permission.access'),
  minWidth: 200,
  formatter(row) {
    const data = row.access || []
    
    // 1. 显示tag而不是title
    if (data.length === 0) {
      return $t('common.noData')
    }
    
    // 使用tag显示，如果没有tag则用name或id
    return data.map(item => item.tag || item.name || `#${item.id}`).join(', ')
  }
}
```

### 更高级的表格显示方案

#### 方案A：使用Element Tag组件
```vue
<template>
  <el-table-column :label="$t('system.project.permission.access')">
    <template #default="{ row }">
      <div class="tag-container">
        <el-tag
          v-for="item in row.access"
          :key="item.id"
          size="small"
          class="mr-2 mb-2"
        >
          {{ item.tag || item.name }}
        </el-tag>
        <span v-if="!row.access?.length" class="text-gray-400">
          {{ $t('common.noData') }}
        </span>
      </div>
    </template>
  </el-table-column>
</template>
```

#### 方案B：显示前几个+数量
```typescript
formatter(row) {
  const data = row.access || []
  const count = data.length
  
  if (count === 0) return $t('common.noData')
  
  const displayTags = data.slice(0, 3).map(item => item.tag || item.name)
  
  if (count <= 3) {
    return displayTags.join(', ')
  } else {
    return `${displayTags.join(', ')} + ${$t('common.moreItems', { count: count - 3 })}`
  }
}
```

### 表单配置
```vue
<template>
  <el-form :model="form">
    <el-form-item :label="$t('system.user.form.name')" required>
      <el-input v-model="form.name" />
    </el-form-item>
    
    <el-form-item :label="$t('system.user.form.email')">
      <el-input v-model="form.email" />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        {{ $t('common.button.submit') }}
      </el-button>
      <el-button @click="handleReset">
        {{ $t('common.button.reset') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>
```

### 消息提示
```typescript
// 成功消息
ElMessage.success($t('message.operation.success'))

// 错误消息
ElMessage.error($t('message.operation.failed'))

// 确认对话框
ElMessageBox.confirm(
  $t('message.confirm.delete'),
  $t('common.prompt'),
  {
    confirmButtonText: $t('common.confirm'),
    cancelButtonText: $t('common.cancel'),
    type: 'warning'
  }
)
```

### 路由配置
```typescript
import { $t } from '@/locales'

export const routes = [
  {
    path: '/user',
    name: 'User',
    meta: {
      title: $t('system.user.title'),
      icon: 'UserFilled'
    },
    component: () => import('@/views/system/user/index.vue')
  }
]
```

## 📄 语言文件格式

### 扁平化格式（推荐）
```json
{
  "system.user.title": "用户管理",
  "system.user.add": "添加用户",
  "system.user.edit": "编辑用户",
  "system.user.field.name": "姓名",
  "system.user.field.email": "邮箱",
  "common.button.save": "保存",
  "common.button.cancel": "取消",
  "message.welcome": "欢迎, {name}!",
  "message.search.result": "找到 {count} 条结果"
}
```

### 嵌套格式（传统）
```json
{
  "system": {
    "user": {
      "title": "用户管理",
      "add": "添加用户",
      "edit": "编辑用户",
      "field": {
        "name": "姓名",
        "email": "邮箱"
      }
    }
  },
  "common": {
    "button": {
      "save": "保存",
      "cancel": "取消"
    }
  },
  "message": {
    "welcome": "欢迎, {name}!",
    "search": {
      "result": "找到 {count} 条结果"
    }
  }
}
```

**系统会自动将扁平格式转换为嵌套格式，两种格式都可以使用。**

## 🎯 最佳实践

### 1. 命名规范
```typescript
// ✅ 推荐：清晰的层级结构
$t('system.user.list.title')      // 系统-用户-列表-标题
$t('common.button.submit')        // 通用-按钮-提交
$t('message.validation.required') // 消息-验证-必填

// ❌ 不推荐：难以维护
$t('btnSave')                     // 无意义前缀
$t('system_user_management_title')// 不使用点分隔符
```

### 2. 模块化组织
```bash
# 按功能模块组织
lang/zh-cn/
├── common.json      # 通用词汇
├── system.json      # 系统模块
├── member.json      # 会员模块
├── order.json       # 订单模块
└── project.json     # 项目模块
```

### 3. 重用通用词汇
```json
// common.json - 定义一次，到处使用
{
  "common.operation": "操作",
  "common.status": "状态",
  "common.enabled": "启用",
  "common.disabled": "禁用",
  "common.createTime": "创建时间",
  "common.updateTime": "更新时间",
  
  "common.button.save": "保存",
  "common.button.cancel": "取消",
  "common.button.submit": "提交",
  "common.button.reset": "重置",
  
  "common.prompt": "提示",
  "common.confirm": "确认",
  "common.cancel": "取消",
  
  "common.noData": "暂无数据",
  "common.loading": "加载中..."
}
```

### 4. 参数化设计
```json
{
  "message.welcome": "欢迎, {name}!",
  "message.page.info": "第 {current} 页，共 {total} 页",
  "message.search.result": "搜索到 {count} 条结果，用时 {time} 秒",
  "message.file.upload.progress": "已上传 {uploaded}MB / 总共 {total}MB ({percent}%)"
}
```

### 5. 状态转换
```typescript
// 表格状态列
{
  prop: 'status',
  label: $t('common.status'),
  width: 100,
  formatter(row) {
    switch (row.status) {
      case 0: return $t('common.status.pending')
      case 1: return $t('common.status.processing')
      case 2: return $t('common.status.completed')
      case 3: return $t('common.status.failed')
      default: return $t('common.status.unknown')
    }
  }
}
```

## 🔍 调试与排查

### 查看加载日志
浏览器控制台会输出详细的加载信息：
```
[LanguageLoader] 开始加载当前目录 lang 语言包...
[LanguageLoader] 直接合并到语言根节点: root -> root -> zh-cn -> common.json
[LanguageLoader] root目录语言包加载完成，共加载 2 个文件
```

### 检查key是否存在
```typescript
// 临时调试代码
console.log('翻译key:', 'system.user.title')
console.log('翻译结果:', $t('system.user.title'))
console.log('语言包结构:', i18n.global.messages)
```

### 常见错误排查
```typescript
// 1. 检查key是否正确
$t('system.user.title')    // ✅ 正确
$t('system.user.title ')   // ❌ 尾部空格
$t('system.user.Title')    // ❌ 大小写问题

// 2. 检查语言文件位置
// 确保文件在正确的目录：lang/zh-cn/system.json

// 3. 检查JSON格式
// 确保JSON文件格式正确，没有语法错误
```

## ❓ 常见问题解答

### Q1: 如何添加新的语言（如日语、韩语）？
**A:** 目前系统只支持中英文。如需添加：
1. 在 `LanguageEnum` 中添加新枚举
2. 在 `langMap` 中添加映射配置
3. 创建对应的语言目录和文件

### Q2: 翻译key找不到怎么办？
**A:** 排查步骤：
1. 检查key拼写（大小写、点分隔符）
2. 确认语言文件已正确放置
3. 查看控制台是否有加载错误
4. 检查网络请求是否成功加载语言文件

### Q3: 如何覆盖基础语言配置？
**A:** 利用优先级机制：
- Apps模块可以覆盖上层目录
- 上层目录可以覆盖当前目录
- 当前目录优先级最高

### Q4: 翻译文本中包含HTML标签怎么办？
**A:** 使用 `v-html` 指令：
```vue
<template>
  <div v-html="$t('message.htmlContent')"></div>
</template>
```

```json
{
  "message.htmlContent": "点击 <a href='/help'>这里</a> 查看帮助"
}
```

### Q5: 如何切换语言？
**A:** 使用 `useI18n`：
```typescript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// 切换到英文
const switchToEnglish = () => {
  locale.value = 'en'
}

// 切换到中文
const switchToChinese = () => {
  locale.value = 'zh'
}
```

### Q6: 如何获取当前语言？
**A:** 
```typescript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
console.log('当前语言:', locale.value) // 'zh' 或 'en'

// 获取语言选项
import { languageOptions } from '@/locales'
console.log('可用语言:', languageOptions)
```

## 📚 扩展文档

- **详细指南**: [多语言使用文档.md](多语言使用文档.md) - 完整系统架构和详细说明
- **快速上手**: [QUICK_START.md](QUICK_START.md) - 一分钟入门
- **表格专项**: [表格多语言示例.md](表格多语言示例.md) - 针对表格场景的深度示例

## 🤝 贡献指南

### 添加新翻译
1. 确定翻译key的命名空间（如 `system.project.permission.access`）
2. 在对应语言目录的JSON文件中添加
3. 同时添加中英文翻译
4. 提交代码前测试翻译效果

### 修改现有翻译
1. 查找要修改的key
2. 在对应位置修改value
3. 确保中英文一致性
4. 更新相关文档（如有必要）

### 报告问题
1. 描述问题现象
2. 提供复现步骤
3. 截图或错误日志
4. 建议的解决方案

---

**💡 提示**: 开始新功能开发前，请先规划好多语言key的命名结构。良好的规划能减少后期的维护成本。

**🚨 重要**: 所有用户可见的文本都必须使用 `$t()` 函数，禁止硬编码中文或英文文本！