import { defineOverridesPreferences } from '#/core/preferences';

/**
 * @description 项目配置文件（业务侧偏好，与 madong-single 对齐）
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 *
 * 容器布局/主题由 app 容器层（#/core/ui/layout）自行管理，这里的 theme/logo 等配置仅服务于
 * 业务代码（#/views、#/components）读取 #/core/preferences 的场景。
 */
export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    // P4 对接 madong 后端菜单管线后切换为 backend
    accessMode: 'frontend',
    enableRefreshToken: true,
  },
  /**
   * 默认 Logo（后端无配置时使用本地文件）
   * public/logo.png 会被复制到构建输出根目录
   */
  logo: {
    source: '/logo.png',
  },
  /**
   * 默认主题模式：明亮（覆盖 core 默认 dark；容器实际主题以 art 设置为准）
   */
  theme: {
    mode: 'light',
  },
  /**
   * 页面切换过渡默认关闭（容器内容区过渡由 art 控制，避免双过渡冲突）
   */
  transition: {
    enable: false,
  },
});
