/**
 * 静态资源处理模块
 *
 * 统一处理框架中的静态资源 URL，支持两种部署模式：
 * 1. 同域访问（默认）：dist 部署到后端 public 目录
 * 2. CDN 访问：使用对象存储或 CDN
 *
 * 优先级：系统配置 > 环境变量 > 默认值
 */

import { useSystemConfigStore } from '@/store/modules/site-config'

// ============================================================================
// 私有工具函数
// ============================================================================

/**
 * 检查是否是完整 URL
 */
const isFullUrl = (url: string): boolean => {
  return /^https?:\/\//i.test(url)
}

/**
 * 检查是否是 Data URL
 */
const isDataUrl = (url: string): boolean => {
  return /^data:[\w\+\/]+/i.test(url)
}

/**
 * 标准化路径（移除开头的斜杠）
 */
const normalizePath = (path: string): string => {
  return path.replace(/^\/+/, '')
}

/**
 * 获取静态资源基础 URL
 *
 * @param domain 可选的域名参数，手动覆盖默认配置
 * @returns 空字符串表示同域访问，字符串表示 CDN 域名
 *
 * 两种模式：
 * - 同域访问：返回空字符串，使用相对路径
 * - CDN 访问：返回完整域名
 */
const getStaticBaseUrl = (domain?: string): string => {
  // 1. 如果手动传入了 domain，优先使用
  if (domain) {
    if (/^https?:\/\//i.test(domain)) {
      // 完整 URL
      return domain.replace(/\/+$/, '')
    }
    // 相对路径前缀
    return domain.replace(/\/+$/, '')
  }

  // 2. 优先使用系统配置（后台动态配置）
  const systemConfig = useSystemConfigStore()
  const configStaticUrl = systemConfig.config.static_url

  if (configStaticUrl) {
    // 处理系统配置的值
    if (/^https?:\/\//i.test(configStaticUrl)) {
      // CDN 模式：返回完整域名
      return configStaticUrl.replace(/\/+$/, '')
    }
    // 其他值视为相对路径前缀（如 /static）
    return configStaticUrl.replace(/\/+$/, '')
  }

  // 3. 其次使用环境变量
  const envStaticUrl = import.meta.env.VITE_STATIC_URL

  // 留空：同域访问，使用相对路径
  if (!envStaticUrl || envStaticUrl.trim() === '') {
    return ''
  }

  // useCurrentDomain：开发环境，使用当前域名
  if (envStaticUrl === 'useCurrentDomain') {
    return window.location.origin
  }

  // CDN 模式：返回完整域名
  if (/^https?:\/\//i.test(envStaticUrl)) {
    return envStaticUrl.replace(/\/+$/, '')
  }

  // 相对路径前缀（如 /static）
  return envStaticUrl.replace(/\/+$/, '')
}

// ============================================================================
// 公共 API
// ============================================================================

/**
 * 构建静态资源完整 URL（支持 CDN 参数）
 *
 * @param path 资源路径（相对路径或完整 URL）
 * @param domain 可选的域名参数，手动覆盖默认配置
 * @param addCdnParams 是否添加 CDN 参数（默认 true）
 * @returns 完整的 URL 或相对路径
 *
 * @example
 * // 同域访问（默认配置）
 * buildStaticUrl('/storage/image.jpg')
 * // => '/storage/image.jpg'
 *
 * // CDN 访问（默认配置）
 * buildStaticUrl('/storage/image.jpg')
 * // => 'https://cdn.example.com/storage/image.jpg?token=xxx'
 *
 * // 手动指定 CDN
 * buildStaticUrl('/storage/image.jpg', 'https://mycdn.com')
 * // => 'https://mycdn.com/storage/image.jpg'
 */
export const buildStaticUrl = (path: string, domain?: string, addParams: boolean = true): string => {
  if (!path) return ''

  // 已经是完整 URL，直接返回
  if (isFullUrl(path)) return addParams ? addCdnParams(path) : path

  // Data URL，直接返回
  if (isDataUrl(path)) return path

  const baseUrl = getStaticBaseUrl(domain)
  const normalizedPath = normalizePath(path)

  // 同域访问：返回相对路径
  if (!baseUrl) {
    return `/${normalizedPath}`
  }

  // CDN 访问：拼接完整 URL
  const fullUrl = `${baseUrl}/${normalizedPath}`
  return addParams ? addCdnParams(fullUrl) : fullUrl
}

/**
 * 批量构建静态资源 URL
 *
 * @param paths 资源路径数组或逗号分隔的字符串
 * @param domain 可选的域名参数，手动覆盖默认配置
 * @returns 完整的 URL 数组
 *
 * @example
 * buildStaticUrls(['/img/1.jpg', '/img/2.jpg'])
 * // => ['/storage/img/1.jpg', '/storage/img/2.jpg']
 *
 * // 手动指定 CDN
 * buildStaticUrls(['/img/1.jpg'], 'https://mycdn.com')
 * // => ['https://mycdn.com/img/1.jpg']
 */
export const buildStaticUrls = (paths: string | string[], domain?: string): string[] => {
  if (typeof paths === 'string') {
    return paths.split(',').filter(Boolean).map(p => buildStaticUrl(p.trim(), domain))
  }
  return paths.filter(Boolean).map(p => buildStaticUrl(p, domain))
}

/**
 * 移除 URL 中的公共路径前缀（支持 CDN 参数移除）
 *
 * @param url 待处理的 URL
 * @param domain 可选指定要移除的特定域名（默认自动检测）
 * @returns 移除前缀后的相对路径
 *
 * @example
 * extractRelativePath('https://cdn.example.com/storage/image.jpg?token=xxx')
 * // => 'storage/image.jpg'
 *
 * extractRelativePath('/adminapi/upload/image.jpg')
 * // => 'upload/image.jpg'
 */
export const extractRelativePath = (url: string, domain?: string): string => {
  if (!url) return ''

  // Data URL，直接返回
  if (isDataUrl(url)) return url

  const systemConfig = useSystemConfigStore()
  const baseDomain = domain || systemConfig.config.cdnUrl || getStaticBaseUrl()

  // 如果有指定的域名，尝试移除
  if (baseDomain) {
    const normalizedDomain = baseDomain.replace(/\/+$/, '')
    let result = url
      .replace(new RegExp(`^https?:\\/\\/${normalizedDomain}\\/?`), '')
      .replace(new RegExp(`^${normalizedDomain}\\/?`), '')

    // 移除 CDN 参数（如果来自同一 CDN）
    if (normalizedDomain === systemConfig.config.cdnUrl && systemConfig.config.cdnUrlParams) {
      const paramStr = `[?&]${systemConfig.config.cdnUrlParams.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      result = result.replace(new RegExp(`${paramStr}(?:&|$)`), '')
    }

    url = result
  }

  // 完整 URL：提取路径部分
  if (isFullUrl(url)) {
    try {
      const urlObj = new URL(url)
      let path = urlObj.pathname

      // 移除 API 前缀
      const apiPrefixes = ['/adminapi', '/webapi', '/api', '/sys']
      for (const prefix of apiPrefixes) {
        if (path.startsWith(prefix)) {
          path = path.substring(prefix.length)
          break
        }
      }

      return normalizePath(path)
    } catch {
      return url
    }
  }

  // 已经是相对路径
  const apiPrefixes = ['/adminapi', '/webapi', '/api', '/sys']
  for (const prefix of apiPrefixes) {
    if (url.startsWith(prefix)) {
      return url.substring(prefix.length).replace(/^\/+/, '')
    }
  }
  return normalizePath(url)
}

/**
 * 检查当前是否使用 CDN 模式
 *
 * @returns true 表示使用 CDN，false 表示同域访问
 */
export const isCdnMode = (): boolean => {
  const baseUrl = getStaticBaseUrl()
  return baseUrl !== ''
}

/**
 * 获取静态资源基础 URL（公共 API）
 * 用于需要手动处理资源路径的场景
 *
 * @param domain 可选的域名参数，手动覆盖默认配置
 * @returns 空字符串表示同域访问，字符串表示 CDN 域名
 *
 * @example
 * // 使用默认配置
 * getStaticUrlBase()
 * // => '' (同域) 或 'https://cdn.example.com' (CDN)
 *
 * // 手动指定
 * getStaticUrlBase('https://mycdn.com')
 * // => 'https://mycdn.com'
 */
export const getStaticUrlBase = (domain?: string): string => {
  return getStaticBaseUrl(domain)
}

/**
 * 添加 CDN URL 参数
 *
 * @param url 基础 URL
 * @returns 添加参数后的 URL
 */
const addCdnParams = (url: string): string => {
  const systemConfig = useSystemConfigStore()
  const cdnUrl = systemConfig.config.cdnUrl
  const cdnParams = systemConfig.config.cdnUrlParams

  // 只有当使用 CDN 且配置了参数时才添加
  if (!cdnUrl || !cdnParams || !url.includes(cdnUrl)) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${cdnParams}`
}

/**
 * 拼接多个 URL 路径
 *
 * @param base 基础路径
 * @param paths 要拼接的路径
 * @returns 拼接后的完整路径
 *
 * @example
 * joinUrls('/api', 'users', '1')
 * // => '/api/users/1'
 *
 * joinUrls('https://example.com', 'api', 'users')
 * // => 'https://example.com/api/users'
 */
export const joinUrls = (base: string, ...paths: string[]): string => {
  return [base.replace(/\/+$/, ''), ...paths.map(p => p.replace(/^\/+/, ''))]
    .filter(Boolean)
    .join('/')
}

// ============================================================================
// 导出别名，方便使用
// ============================================================================
export const staticUrl = buildStaticUrl
export const staticUrls = buildStaticUrls
