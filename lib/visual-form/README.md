# Visual Form 授权产物

该目录只保存可替换的 VForm3 Pro 授权产物：

- `designer.es.js`
- `designer.umd.js`
- `designer.style.css`
- `favicon.ico`

目录内不放 `package.json`、应用源码、Vue 生命周期、Element Plus 注册或主题适配。
应用接入统一由 `src/core/plugins/visual-form` 处理。

升级授权产物后，Vite 会重新扫描 UMD 并自动生成 Element Plus 按需依赖。
