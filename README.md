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
   - [自定义列ApiDict回显组件·重构类型定义](https://www.bilibili.com/cheese/play/ep1899739)
   - [自定义列回显组件优化·初探](https://www.bilibili.com/cheese/play/ep1899741)
   - [自定义列回显组件优化·引入componentMap机制](https://www.bilibili.com/cheese/play/ep1899742)
   - [自定义列回显组件优化·新增管理componentMap方法](https://www.bilibili.com/cheese/play/ep1899743)
   - [自定义列回显组件优化·自动注册](https://www.bilibili.com/cheese/play/ep1899744)
   - [自定义列新增component和componentProps配置](https://www.bilibili.com/cheese/play/ep1899745)
   - [自定义列回显组件·终](https://www.bilibili.com/cheese/play/ep1899746)
   - [搜索表单·初探](https://www.bilibili.com/cheese/play/ep1905465)
   - [搜索表单·常用控件](https://www.bilibili.com/cheese/play/ep1905466)
   - [搜索表单·修复日期控制bug](https://www.bilibili.com/cheese/play/ep1905467)
   - [搜索表单·select和radio](https://www.bilibili.com/cheese/play/ep1905478)
   - [搜索表单·自定义字典组件·初探](https://www.bilibili.com/cheese/play/ep1905479)
   - [搜索表单·自定义字典组件·实现Select逻辑](https://www.bilibili.com/cheese/play/ep1908981)
   - [搜索表单·自定义字典组件·实现RadioGroup逻辑](https://www.bilibili.com/cheese/play/ep1908982)
   - [搜索表单·自定义字典组件·实现RadioGroup按钮组逻辑](https://www.bilibili.com/cheese/play/ep1908983)
   - [搜索表单·自定义字典组件·实现CheckboxGroup](https://www.bilibili.com/cheese/play/ep1908984)
   - [操作列·初探](https://www.bilibili.com/cheese/play/ep1909549)
   - [操作列·插槽方式](https://www.bilibili.com/cheese/play/ep1909551)
   - [操作列·自定义TableAction组件·初探](https://www.bilibili.com/cheese/play/ep1909552)
   - [操作列·自定义TableAction组件·移植逻辑](https://www.bilibili.com/cheese/play/ep1909553)
   - [操作列·自定义TableAction组件·图标](https://www.bilibili.com/cheese/play/ep1909554)
   - [操作列·自定义TableAction组件·更多](https://www.bilibili.com/cheese/play/ep1909555)
   - [操作列·自定义TableAction组件·权限码](https://www.bilibili.com/cheese/play/ep1909556)
   - [操作列·自定义TableAction组件·气泡确认框](https://www.bilibili.com/cheese/play/ep1909557)
   - [操作列·自定义TableAction组件·确认消息框](https://www.bilibili.com/cheese/play/ep1909559)
   - [表格组件·多选行与本章小结](https://www.bilibili.com/cheese/play/ep1909560)
* 第五章·增删改查样例(上)
   - [增删改查样例·用户列表调整](https://www.bilibili.com/cheese/play/ep1910156)
   - [修复页面修改TableAction不渲染bug](https://www.bilibili.com/cheese/play/ep1910157)
   - [增删改查样例·抽离schemas表单配置项](https://www.bilibili.com/cheese/play/ep1910158)
   - [增删改查样例·抽离schemas表格列配置](https://www.bilibili.com/cheese/play/ep1910159)
   - [让框架支持jsx语法(上)](https://www.bilibili.com/cheese/play/ep1910160)
   - [让框架支持jsx语法(下)](https://www.bilibili.com/cheese/play/ep1910161)
   - [让.vue文件支持jsx语法](https://www.bilibili.com/cheese/play/ep1910162)
   - [增删改查样例·弹窗表单·初探](https://www.bilibili.com/cheese/play/ep1910864)
   - [增删改查样例·弹窗表单·常用属性](https://www.bilibili.com/cheese/play/ep1910865)
   - [增删改查样例·弹窗表单·全屏逻辑处理](https://www.bilibili.com/cheese/play/ep1910866)
   - [弹窗表单·关于设置全屏后footer显示错位问题issues](https://www.bilibili.com/cheese/play/ep1910867)
   - [增删改查样例·弹窗表单·表单初探](https://www.bilibili.com/cheese/play/ep1910868)
* 第六章·自定义表单组件
   - [表单元数据](https://www.bilibili.com/cheese/play/ep1913468)
   - [自定义表单组件](https://www.bilibili.com/cheese/play/ep1913469)
   - [自定义表单组件·slot处理(一)](https://www.bilibili.com/cheese/play/ep1913470)
   - [自定义表单组件·slot处理(二)](https://www.bilibili.com/cheese/play/ep1913476)
   - [自定义表单组件·slot处理(三)](https://www.bilibili.com/cheese/play/ep1913477)
   - [自定义表单组件·24栅格](https://www.bilibili.com/cheese/play/ep1913478)
   - [自定义表单组件·提交和重置按钮](https://www.bilibili.com/cheese/play/ep1916170)
   - [自定义表单组件·提交和重置逻辑](https://www.bilibili.com/cheese/play/ep1916171)
   - [自定义表单组件·expose方法](https://www.bilibili.com/cheese/play/ep1916172)
   - [自定义表单组件·expose表单原有的方法](https://www.bilibili.com/cheese/play/ep1916173)
   - [自定义表单组件·仿vben5的方式定义和使用表单组件](https://www.bilibili.com/cheese/play/ep1916174)
   - [自定义表单组件·仿vben5·简单说明](https://www.bilibili.com/cheese/play/ep1916175)
   
   持续更新中……