# Madong-Vue

基于 Vue 3 + Vite 的现代化管理后台前端框架，专为对接 MD-Admin 5.x 版本后端服务设计。采用 Composition API 和 TypeScript 开发，提供响应式布局和完整的权限管理功能。

## 项目介绍

Madong-Vue 是一个基于 Vue 3 + Vite 的现代化管理后台前端框架，专为对接 MD-Admin 5.x完整界面后台前端，旨在为开发者提供快速构建企业级管理系统的能力。

## 核心特性

- 🎨 现代化设计风格，模块化架构
- 📊 丰富的数据可视化组件，基于 ECharts
- 🛡 完整的权限控制系统，细粒度权限管理
- 📱 响应式布局，支持移动端访问
- 🌐 多语言支持（中文/英文）
- 📦 集成常用业务模块（用户、角色、菜单等管理）
- 📝 富文本编辑器集成
- 📁 文件上传下载功能
- 🕒 全面的日志管理系统
- 🔧 完善的 CRUD 功能模板

## 技术栈

- **前端框架**：Vue 3 + TypeScript + Vite
- **UI 组件库**：Element Plus
- **路由管理**：Vue Router 4
- **状态管理**：Pinia
- **网络请求**：Axios
- **数据可视化**：ECharts
- **样式预处理器**：Sass

## 目录结构

```bash
├── public/              # 静态资源
├── src/                 # 主应用目录
│   ├── apps/            # 功能模块目录
│   │   ├── demo/        # 示例模块
│   │   └── official/    # 官方模块
│   ├── assets/          # 静态资源文件
│   ├── components/      # 通用组件
│   ├── config/          # 配置文件
│   ├── locales/         # 多语言
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   ├── lang/            # 多语言文件
│   ├── api/             # 接口定义
│   ├── views/           # 页面视图
│   └── main.ts          # 入口文件
├── .env                 # 环境变量配置
└── vite.config.ts       # Vite 配置
```

## 快速开始

1. **安装依赖**

```bash
pnpm install
```

2. **启动开发服务器**

```bash
pnpm dev
```

3. **构建生产环境包**

```bash
pnpm build
```

4. **预览生产构建**

```bash
pnpm preview
```

## 使用说明

- **系统配置**：`src/config/index.ts`
- **路由配置**：`src/router/index.ts`
- **状态管理**：`src/store/index.ts`
- **接口定义**：`src/api/` 目录
- **组件使用**：`src/components/` 目录
- **页面开发**：`src/app/views/` 目录
- **CRUD 模板**：参考 `AI_CONTEXT.md` 文件

## 开发规范

- 采用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 目录结构遵循项目规范

## 贡献指南

欢迎贡献代码和反馈问题！请先阅读 CONTRIBUTING.md 文档。

## 许可证

该项目采用 MIT 许可证。详见 LICENSE 文件。
