# Madong UI Admin Art Design

这是一个基于 Vue3 + Vite 的中后台管理系统模板，提供丰富的组件库和完整的权限管理系统。

## 功能特性

- 🎨 采用模块化设计的 Art Design 风格
- 📊 丰富的数据可视化组件
- 🛡 完整的权限控制系统
- 📱 响应式布局支持移动端访问
- 🌐 多语言支持（中/英）
- 📦 集成常用业务模块（用户管理、角色管理、菜单管理等）
- 📊 提供多种统计报表组件
- 📝 富文本编辑器集成
- 📁 文件上传下载功能
- 🕒 全面的日志管理系统

## 技术栈

- Vue3 + TypeScript + Vite
- Element Plus 组件库
- Vue Router 4
- Pinia 状态管理
- Axios 网络请求
- ECharts 数据可视化
- Sass 样式预处理器

## 目录结构

```bash
├── public/              # 静态资源
├── src/
│   ├── api/             # 接口定义
│   ├── assets/          # 静态资源文件
│   ├── components/      # 通用组件
│   ├── config/          # 配置文件
│   ├── locales/         # 多语言文件
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   └── main.ts          # 入口文件
├── .env                 # 环境变量配置
└── vite.config.ts       # Vite 配置
```

## 快速开始

1. 安装依赖
```bash
pnpm install
```

2. 启动开发服务器
```bash
pnpm dev
```

3. 构建生产环境包
```bash
pnpm build
```

## 使用说明

- 系统配置：`src/config/index.ts`
- 路由配置：`src/router/index.ts`
- 状态管理：`src/store/index.ts`
- 接口定义：`src/api/` 目录
- 组件使用：`src/components/` 目录

## 贡献指南

欢迎贡献代码和反馈问题！请先阅读 CONTRIBUTING.md 文档。

## 许可证

该项目采用 MIT 许可证。详见 LICENSE 文件。