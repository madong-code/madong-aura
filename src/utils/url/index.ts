/**
 * URL 工具模块
 *
 * 统一处理框架中的 URL，重新导出静态资源模块的所有 API
 */

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
