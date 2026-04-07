# 多语言快速使用指南

## 一分钟上手

### 1. 导入翻译函数
```typescript
import { $t } from '@/locales'
```

### 2. 在模板中使用
```vue
<template>
  <h1>{{ $t('system.title') }}</h1>
  <button>{{ $t('common.button.save') }}</button>
</template>
```

### 3. 在代码中使用
```typescript
const title = $t('system.user.title')
const message = $t('message.welcome', { name: '张三' })
```

## 常用示例

### 表格列配置
```typescript
const columns = [
  {
    prop: 'name',
    label: $t('system.user.field.name'),
    minWidth: 120
  },
  {
    prop: 'email',
    label: $t('system.user.field.email'),
    minWidth: 180
  },
  {
    prop: 'status',
    label: $t('common.status'),
    width: 100,
    formatter(row) {
      return row.status ? $t('common.enabled') : $t('common.disabled')
    }
  }
]
```

### 表单标签
```vue
<template>
  <el-form :model="form">
    <el-form-item :label="$t('system.user.form.name')">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item :label="$t('system.user.form.email')">
      <el-input v-model="form.email" />
    </el-form-item>
  </el-form>
</template>
```

### 按钮文本
```vue
<template>
  <el-button type="primary" @click="handleSave">
    {{ $t('common.button.save') }}
  </el-button>
  <el-button @click="handleCancel">
    {{ $t('common.button.cancel') }}
  </el-button>
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

## 语言包创建示例

### 1. 创建中文语言文件
```json
// lang/zh-cn/system.json
{
  "system.title": "系统管理",
  "system.user.title": "用户管理",
  "system.user.add": "添加用户",
  "system.user.edit": "编辑用户",
  "system.user.delete": "删除用户",
  
  "system.user.field.name": "姓名",
  "system.user.field.email": "邮箱",
  "system.user.field.phone": "手机号",
  
  "system.user.form.name": "用户名",
  "system.user.form.password": "密码",
  "system.user.form.role": "角色"
}
```

### 2. 创建英文语言文件
```json
// lang/en/system.json
{
  "system.title": "System Management",
  "system.user.title": "User Management",
  "system.user.add": "Add User",
  "system.user.edit": "Edit User",
  "system.user.delete": "Delete User",
  
  "system.user.field.name": "Name",
  "system.user.field.email": "Email",
  "system.user.field.phone": "Phone",
  
  "system.user.form.name": "Username",
  "system.user.form.password": "Password",
  "system.user.form.role": "Role"
}
```

## 常见模式

### 参数化翻译
```json
// 语言文件
{
  "message.welcome": "欢迎, {name}!",
  "message.search.result": "找到 {count} 条结果"
}
```

```typescript
// 使用
$t('message.welcome', { name: '张三' })
$t('message.search.result', { count: 25 })
```

### 状态转换
```typescript
// 表格状态列
{
  prop: 'status',
  label: $t('common.status'),
  formatter(row) {
    return row.status === 1 
      ? $t('common.enabled') 
      : $t('common.disabled')
  }
}
```

### 日期格式化
```typescript
// 如果有日期相关的翻译
$t('common.date.today')      // "今天"
$t('common.date.yesterday')  // "昨天"
$t('common.date.thisWeek')   // "本周"
```

## 调试技巧

### 1. 检查key是否存在
```typescript
// 临时调试
console.log('翻译key:', 'system.user.title')
console.log('翻译结果:', $t('system.user.title'))
```

### 2. 查看所有可用key
在浏览器控制台查看语言包加载日志，了解已加载的语言包结构。

### 3. 快速测试
```vue
<template>
  <!-- 临时测试翻译 -->
  <div>{{ $t('test.key') || '未找到翻译' }}</div>
</template>
```

## 重要提醒

1. **所有界面文本都应使用 `$t()` 函数**
2. **避免在代码中硬编码中文/英文文本**
3. **新功能开发时同步添加多语言支持**
4. **保持语言key的命名一致性**
5. **使用通用词汇减少重复翻译**

## 获取帮助

- 查看详细文档：`多语言使用文档.md`
- 参考现有代码中的使用示例
- 检查控制台的语言包加载日志
- 团队内部统一翻译规范