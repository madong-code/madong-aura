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

* 第一章·基础篇
   - [环境准备](https://www.bilibili.com/cheese/play/ep1893365)
   - [体验一下](https://www.bilibili.com/cheese/play/ep1893366)
   - [apifox简单介绍](https://www.bilibili.com/cheese/play/ep1893367)
   - [替换接口地址](https://www.bilibili.com/cheese/play/ep1893368)
   - [角色编码返回处理](https://www.bilibili.com/cheese/play/ep1893369)
   - [关于代码提交](https://www.bilibili.com/cheese/play/ep1893370)
   - [更换真实接口遇到的问题](https://www.bilibili.com/cheese/play/ep1893371)
   - [尝试添加一个页面](https://www.bilibili.com/cheese/play/ep1893372)
   - [路由模块重构·文件拆分](https://www.bilibili.com/cheese/play/ep1893373)
   - [路由模块重构·自动导入](https://www.bilibili.com/cheese/play/ep1893374)
* 第二章·权限管理
   - [前端控制模式·初探](https://www.bilibili.com/cheese/play/ep1893378)
   - [前端控制模式·复现bug](https://www.bilibili.com/cheese/play/ep1893380)
   - [权限管理·后端控制模式·初探](https://www.bilibili.com/cheese/play/ep1893381)
   - [后端控制模式·权限码·自定义指令](https://www.bilibili.com/cheese/play/ep1893382)
   - [后端控制模式·权限指令源码解读](https://www.bilibili.com/cheese/play/ep1893383)
   - [hasAuth方法·初探](https://www.bilibili.com/cheese/play/ep1893394)
   - [hasAuth方法·源码解读](https://www.bilibili.com/cheese/play/ep1893395)
   - [获取用户权限码接口联调](https://www.bilibili.com/cheese/play/ep1893396)
   - [优化·增加超管标识判断](https://www.bilibili.com/cheese/play/ep1893397)
   - [v-roles指令](https://www.bilibili.com/cheese/play/ep1893873)
* 第三章·打包发布
   - [打包发布·初探](https://www.bilibili.com/cheese/play/ep1893906)
   - [打包发布·build](https://www.bilibili.com/cheese/play/ep1893907)
   - [打包发布·处理打包报错问题](https://www.bilibili.com/cheese/play/ep1893908)
   - [打包发布·云效持续集成](https://www.bilibili.com/cheese/play/ep1893930)
* 第四章·表格组件
   - [表格组件·初探](https://www.bilibili.com/cheese/play/ep1894016)
   - [表格组件·分页参数](https://www.bilibili.com/cheese/play/ep1894017)
   - [表格组件·响应数据适配器](https://www.bilibili.com/cheese/play/ep1894019)
   - [表格组件·数据转换函数](https://www.bilibili.com/cheese/play/ep1894020)
   - [表格组件·formatter格式化列](https://www.bilibili.com/cheese/play/ep1894021)
   - [表格组件·自定义列模板](https://www.bilibili.com/cheese/play/ep1894022)
   - [自定义列ApiDict回显组件·初探](https://www.bilibili.com/cheese/play/ep1894790)
   - [自定义列ApiDict回显组件·实现请求逻辑](https://www.bilibili.com/cheese/play/ep1894791)
   - [自定义列ApiDict回显组件·优化](https://www.bilibili.com/cheese/play/ep1894792)
   - [自定义列ApiDict回显组件·增加初始化所有](https://www.bilibili.com/cheese/play/ep1894794)
   - [番外篇·更新项目代码](https://www.bilibili.com/cheese/play/ep1894795)
   - [番外篇·验证更新的代码](https://www.bilibili.com/cheese/play/ep1894796)
   - [番外篇·再次更新项目代码](https://www.bilibili.com/cheese/play/ep1894798)
   - [自定义列ApiDict回显组件·调用接口初始化](https://www.bilibili.com/cheese/play/ep1894799)
   - [自定义列ApiDict回显组件·使用Tag渲染](https://www.bilibili.com/cheese/play/ep1894954)
   - [自定义列ApiDict回显组件·使用Tag渲染多值优化](https://www.bilibili.com/cheese/play/ep1894955)
   - [自定义列ApiDict回显组件·Tag主题色实现](https://www.bilibili.com/cheese/play/ep1897278)
   - [自定义列ApiDict回显组件·Tag增加颜色配置项](https://www.bilibili.com/cheese/play/ep1897279)
   - [自定义列ApiDict回显组件·重构Tag增加颜色配置项](https://www.bilibili.com/cheese/play/ep1897285)
   - [自定义列ApiDict回显组件·优化代码](https://www.bilibili.com/cheese/play/ep1897280)
   - [自定义列ApiDict回显组件·新增预设颜色列表配置项](https://www.bilibili.com/cheese/play/ep1897284)
   - [自定义列ApiDict回显组件·AI生成预设颜色列表](https://www.bilibili.com/cheese/play/ep1897286)
   - [自定义列ApiDict回显组件·修复useColorList无效](https://www.bilibili.com/cheese/play/ep1897287)
   - [自定义列ApiDict回显组件·使用接口中的颜色配置](https://www.bilibili.com/cheese/play/ep1897289)


   持续更新中……