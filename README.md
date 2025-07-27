## 简介

mldong-ant-design基于art-design-pro的快速开发框架前端工程

## 特性

- **最新技术栈**：使用 Vue3/vite 等前端前沿技术开发
- **TypeScript**：应用程序级 JavaScript 的语言
- **主题**：提供多套主题色彩，可配置自定义主题
- **国际化**：内置完善的国际化方案
- **权限**：内置完善的动态路由权限生成方案

## 演示地址(apifox云mock版)

- [演示地址-mock版](https://www.mldong.com/?nav=onlinedemo-8)

测试账号: admin/123456


## 安装使用

1. 获取项目代码

```bash
git clone https://gitee.com/mldong/mldong-art-design.git
```

2. 安装依赖

```bash
cd mldong-art-design


pnpm install
```

- 修改代理地址vite.config.mts

```ts
return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    server: {
      port: parseInt(VITE_PORT),
      proxy: {
        '/api': {
          target: 'https://apifox-plus.mldong.com/m1/3323228-2823297-default',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      host: true
    },
```

- 运行

```bash
pnpm dev
```

4. 打包

```bash
pnpm build
```

## 相关项目

- [配套后端-java版](https://gitee.com/mldong/mldong)
- [配套后端-python版](https://gitee.com/mldong666/mldong-python)
- [配套后端-nodejs版](https://gitee.com/mldong/mldong-koa)
- [配套后端-GoLang版](https://gitee.com/mldong/mldong-goframe)
- [vben5文档](https://doc.mldong.com/mldong/front-pro/pro-explain.html/)

## 学习视频

