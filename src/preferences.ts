/**
 * 应用偏好设置（admin 业务层 #/core/preferences 的初始化入口）
 *
 * art-admin 的 UI 布局由 art-design-pro 的 setting store 控制，
 * 这里的 preferences 主要供 admin 业务层（core/request、core/locales、
 * core/access、CRUD 组件等）读取运行时配置。
 *
 * 两者的职责划分：
 * - art setting store：主题、菜单折叠、标签页、暗黑模式等 **视觉** 配置
 * - core preferences：语言、权限模式、水印、动态标题等 **业务运行时** 配置
 */
import { defineOverridesPreferences } from '#/core/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    // 权限模式：backend 由后端下发菜单（与 admin 保持一致）
    accessMode: 'backend',
    // 语言默认跟随 art 壳的中文
    locale: 'zh-CN',
    // 布局交由 art 壳接管，这里不再使用 vben 的布局
    layout: 'sidebar-nav',
    // 关闭 vben 自带的偏好设置抽屉（art 有自己的设置面板）
    enablePreferences: false,
    // 关闭 vben 的检查更新（art 有 systemUpgrade）
    enableCheckUpdates: false,
    watermark: false,
  },
  logo: {
    source: '',
  },
  theme: {
    // 主题由 art 的 useTheme 接管
    mode: 'auto',
  },
  widget: {
    // 这些小组件都在 art 的 header-bar 里，关闭 vben 的
    fullscreen: false,
    globalSearch: false,
    languageToggle: false,
    lockScreen: false,
    notification: false,
    sidebarToggle: false,
    themeToggle: false,
  },
});
