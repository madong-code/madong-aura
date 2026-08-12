/**
 * admin 业务层（core）的设计样式入口
 *
 * 【art-admin 改动】
 * 移除了 `import './css/global.css'`。
 *
 * global.css 的内容只有一行 `@import '@vben/tailwind-config/theme'`，
 * 在 vben 单体应用里它负责产出整份 Tailwind。
 * 但 art-admin 已经由 `src/assets/styles/core/tailwind.css` 产出 Tailwind，
 * 这里再 import 一次会：
 *   1. 重复输出全部 utilities（产物体积翻倍）；
 *   2. 后加载的一份覆盖前一份，导致 art 与 admin 的 `--color-primary` 打架。
 *
 * theme 仍可被各组件通过 `@reference "@vben/tailwind-config/theme"` 引用，
 * `@reference` 只解析不产出，不存在重复问题。
 *
 * 保留下面这些是必须的：
 * - design-tokens：提供 --primary / --background / --border 等 HSL 变量，
 *   是 admin 组件所有 `bg-primary`、`text-foreground` 的取值来源；
 * - transition / nprogress / ui：admin 组件的过渡与细节样式。
 */
import './design-tokens';

import './css/transition.css';
import './css/nprogress.css';
import './css/ui.css';
