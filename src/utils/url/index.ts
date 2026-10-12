/**
 * URL 工具模块
 *
 * 统一处理框架中的 URL，重新导出静态资源模块的所有 API
 */

// ============================================================================
// 应用内页面 URL（window.location 硬跳转用）
// ============================================================================

/**
 * 构建应用内页面的完整 URL，供 window.location 等硬跳转使用。
 *
 * 必须考虑部署 base（如 integrated 模式下 VITE_BASE=/admin/，包部署在
 * backend/public/admin），直接 location.assign('/auth/login') 会丢失
 * /admin 前缀，跳到域名根路径导致 404。
 *
 * - history 模式：base + path，如 /admin/auth/login
 * - hash 模式：base + '#' + path，如 /admin/#/auth/login
 *
 * @param path 应用内路由路径，需以 / 开头，可携带 query（如 /auth/login?redirect=xxx）
 * @returns 可直接赋给 window.location 的完整路径
 */
export function buildAppUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (import.meta.env.VITE_ROUTER_HISTORY === 'hash') {
    return `${base}#${normalizedPath}`;
  }

  // history 模式：拼接 base（去掉末尾斜杠）与路径
  return `${base.replace(/\/+$/, '')}${normalizedPath}`;
}

// ============================================================================
// 重新导出静态资源模块 API
// ============================================================================

export {
  buildStaticUrl,
  buildStaticUrls,
  extractRelativePath,
  getStaticUrlBase,
  isCdnMode,
  joinUrls,
  staticUrl,
  staticUrls,
} from '#/utils/url/static-resource';
