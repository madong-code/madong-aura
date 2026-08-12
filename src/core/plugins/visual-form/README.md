# Visual Form 接入层

该目录负责 `lib/visual-form` 授权产物的应用接入：

- 懒加载 UMD 和授权样式；
- 消费 Vite 根据授权 UMD 自动生成的 Element Plus 按需组件模块；
- 注册 Visual Form 组件；
- 加载应用暗黑主题兼容样式；
- 对外提供 `installVisualForm()` 和 `useVForm()`。

`build/vite/plugins/visual-form.ts` 会扫描 `designer.umd.js` 中的 `resolveComponent("el-*")` 调用，并生成组件、样式和必要服务的虚拟模块。升级授权产物后无需维护组件清单。

禁止执行 `app.use(ElementPlus)` 全量注册。授权目录不得放入应用生命周期、主题或框架适配代码。
