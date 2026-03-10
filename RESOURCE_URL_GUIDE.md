# 资源 URL 处理机制说明

## 概述

本框架提供了一套完整的资源 URL 处理机制，支持多种前后端部署场景。

## 支持的部署场景

### 1. 同域部署
**场景**：前后端在同一域名，如 `example.com` 都在同一服务器

**配置**：
```javascript
// .env
VITE_API_URL = /
```

**处理**：
- 存储：相对路径 `/upload/image.jpg`
- 显示：`https://example.com/upload/image.jpg`

### 2. 前后端分离代理转发
**场景**：开发环境通过代理访问后端

**配置**：
```javascript
// .env.development
VITE_API_URL = /adminapi
VITE_API_PROXY_URL = http://127.0.0.1:8001
```

**处理**：
- 存储：相对路径 `upload/image.jpg`
- 显示：`https://localhost:3000/upload/image.jpg`（通过静态资源域名）

### 3. 前后端分离直接访问
**场景**：生产环境前后端跨域部署

**配置**：
```javascript
// .env.production
VITE_API_URL = https://api.example.com
```

**处理**：
- 存储：相对路径 `upload/image.jpg`
- 显示：`https://api.example.com/upload/image.jpg`

### 4. OSS/CDN
**场景**：使用对象存储（阿里云 OSS、腾讯云 COS 等）

**系统配置**：
```javascript
{
  storage_type: 'aliyun_oss',
  url_mode: 'absolute',
  cdn_url: 'https://cdn.example.com',
  enable_static_cdn: true,
  cdn_params: 'token=xxx&version=v1'
}
```

**处理**：
- 存储：完整 URL `https://cdn.example.com/upload/image.jpg`
- 显示：直接使用完整 URL，自动添加 CDN 参数

### 5. 混合模式
**场景**：静态资源走 CDN，API 走后端

**配置**：
```javascript
{
  static_domain: 'https://static.example.com',
  cdn_url: 'https://cdn.example.com',
  enable_static_cdn: true
}
```

**处理**：
- 存储：相对路径 `upload/image.jpg`
- 显示：`https://static.example.com/upload/image.jpg`

## 核心 API

### buildResourceUrl(relativeUrl, options?)

构建资源完整 URL

**参数**：
- `relativeUrl`: 相对路径或完整 URL
- `options`: 可选配置，可覆盖系统配置

**返回**：完整 URL

```javascript
import { buildResourceUrl } from '@/utils'

// 相对路径转完整 URL
const url = buildResourceUrl('/upload/image.jpg')
// => 'https://example.com/upload/image.jpg'

// 完整 URL 直接返回
const url2 = buildResourceUrl('https://cdn.example.com/image.jpg')
// => 'https://cdn.example.com/image.jpg'
```

### extractRelativePath(url, options?)

提取相对路径（用于存储）

**参数**：
- `url`: 完整 URL 或相对路径
- `options`: 可选配置

**返回**：相对路径或完整 URL（取决于配置）

```javascript
import { extractRelativePath } from '@/utils'

// 完整 URL 转相对路径
const path = extractRelativePath('https://example.com/upload/image.jpg')
// => 'upload/image.jpg'

// OSS 模式可能返回完整 URL
const path2 = extractRelativePath('https://cdn.example.com/image.jpg', { urlMode: 'absolute' })
// => 'https://cdn.example.com/image.jpg'
```

### batchProcessUrls(urls, mode, options?)

批量处理 URL

```javascript
import { batchProcessUrls } from '@/utils'

// 构建完整 URL
const fullUrls = batchProcessUrls('/img1.jpg,/img2.jpg', 'build')
// => ['https://example.com/img1.jpg', 'https://example.com/img2.jpg']

// 提取相对路径
const relativePaths = batchProcessUrls(['https://ex.com/a.jpg', 'https://ex.com/b.jpg'], 'extract')
// => ['a.jpg', 'b.jpg']
```

## 组件使用

### PosterUpload 组件

```vue
<template>
  <PosterUpload v-model="imageUrl" />
</template>

<script setup>
import { ref } from 'vue'
import PosterUpload from './components/poster-upload.vue'

const imageUrl = ref('')
</script>
```

**Props**：
- `value` (String): 图片 URL
- `autoHandleBaseUrl` (Boolean): 是否自动处理 URL，默认 true
- `urlMode` (String): URL 处理模式，'auto' | 'relative' | 'absolute'
- `width` (Number): 宽度，默认 320
- `height` (Number): 高度，默认 150

### Avatar 组件

```vue
<template>
  <Avatar v-model="avatarUrl" />
</template>
```

**Props**：
- `value` (String): 头像 URL
- `autoHandleBaseUrl` (Boolean): 是否自动处理 URL，默认 true
- `urlMode` (String): URL 处理模式

## 配置说明

### 环境变量

| 变量名 | 说明 | 示例 |
|---------|------|------|
| `VITE_BASE_URL` | 应用基础路径 | `/` 或 `/admin/` |
| `VITE_API_URL` | API 地址 | `/` 或 `/adminapi` 或 `https://api.example.com` |
| `VITE_API_PROXY_URL` | 代理目标地址 | `http://127.0.0.1:8001` |

### 系统配置

通过 `useSystemConfigStore()` 配置：

```javascript
{
  // 存储类型
  storage_type: 'local' | 'aliyun_oss' | 'tencent_cos' | 'qiniu' | 'aws_s3',

  // URL 处理模式
  url_mode: 'auto' | 'relative' | 'absolute',

  // CDN 域名
  cdn_url: 'https://cdn.example.com',

  // CDN URL 参数（如 OSS 签名）
  cdn_params: 'token=xxx&version=v1',

  // 静态资源域名（与 API 分离）
  static_domain: 'https://static.example.com',

  // 是否启用静态资源 CDN
  enable_static_cdn: true
}
```

## 最佳实践

### 1. 本地开发
```javascript
// .env.development
VITE_API_URL = /adminapi
VITE_API_PROXY_URL = http://127.0.0.1:8001
```

### 2. 测试环境（同域）
```javascript
// .env.test
VITE_API_URL = /
```

### 3. 生产环境（前后端分离）
```javascript
// .env.production
VITE_API_URL = https://api.example.com
```

### 4. 生产环境（CDN）
```javascript
// 系统配置
{
  storage_type: 'aliyun_oss',
  url_mode: 'absolute',
  cdn_url: 'https://cdn.example.com',
  enable_static_cdn: true
}
```

## 工具函数

### isSameOrigin()
判断是否为同域部署

```javascript
import { isSameOrigin } from '@/utils'

if (isSameOrigin()) {
  // 同域，使用相对路径
}
```

### isUsingCdn()
判断是否使用 CDN

```javascript
import { isUsingCdn } from '@/utils'

if (isUsingCdn()) {
  // 使用 CDN
}
```

### isOssStorage()
判断是否为 OSS 存储

```javascript
import { isOssStorage } from '@/utils'

if (isOssStorage()) {
  // OSS 存储，可能需要特殊处理
}
```

## 迁移指南

### 从旧版本迁移

旧版本使用 `fullUrl` 和 `stripBaseUrl`：

```javascript
// 旧版本
import { fullUrl, stripBaseUrl } from '@/utils'

// 显示
const displayUrl = fullUrl(imageUrl)

// 存储
const storageUrl = stripBaseUrl(imageUrl)
```

新版本使用资源处理机制：

```javascript
// 新版本
import { buildResourceUrl, extractRelativePath } from '@/utils'

// 显示
const displayUrl = buildResourceUrl(imageUrl)

// 存储
const storageUrl = extractRelativePath(imageUrl)
```

## 常见问题

### Q: 为什么显示的图片多了 `/adminapi` 前缀？

A: 检查 `VITE_API_URL` 配置。静态资源不应该使用 API 前缀。

解决方法：
- 方法 1：配置 `static_domain`
- 方法 2：使用 `extractRelativePath` 提取相对路径

### Q: OSS 图片无法显示？

A: 检查系统配置：
- `storage_type` 是否正确
- `cdn_url` 是否配置
- `url_mode` 是否为 `absolute`

### Q: 代理模式下图片 404？

A: 检查 `static_domain` 配置，确保静态资源不经过 API 代理。

## 技术细节

### URL 处理优先级

1. 如果是完整 URL（http:// 或 https://），直接返回
2. 如果是 Data URL（base64），直接返回
3. 否则根据配置拼接域名

### 路径标准化

- 自动移除 API 前缀（/adminapi, /webapi, /api, /sys）
- 自动处理 CDN 参数
- 自动处理斜杠

### 性能优化

- 使用 `computed` 缓存计算结果
- 批量处理避免重复计算
- 条件判断提前返回

## 相关文件

- `src/utils/resource.ts` - 资源 URL 处理核心逻辑
- `src/apps/official/views/doc/components/poster-upload.vue` - 海报上传组件
- `src/components/form/components/avatar.vue` - 头像上传组件
- `.env*` - 环境配置文件
