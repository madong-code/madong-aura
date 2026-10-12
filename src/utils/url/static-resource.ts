/**
 * 静态资源处理模块
 *
 * 统一处理框架中的静态资源 URL，支持两种部署模式：
 * 1. 同域访问（默认）：dist 部署到后端 public 目录
 * 2. CDN 访问：使用对象存储或 CDN
 *
 * 优先级：系统配置 > 环境变量 > 默认值
 */

import { useSiteConfigStore } from '#/store/modules/site-config';

import { resolveSignedUrl } from './private-storage';

// ============================================================================
// 常量
// ============================================================================

/** API 前缀列表（用于 `extractRelativePath` 剥离路径） */
const API_PREFIXES = ['/adminapi', '/webapi', '/api', '/sys'];

// ============================================================================
// 私有工具函数
// ============================================================================

/** 是否是完整 URL（http/https 开头） */
const isFullUrl = (url: string): boolean => /^https?:\/\//i.test(url);

/** 是否是 Data URL */
const isDataUrl = (url: string): boolean => /^data:/i.test(url);

/** 是否是 Blob URL */
const isBlobUrl = (url: string): boolean => /^blob:/i.test(url);

/** 是否是协议相对 URL（// 开头，如 //cdn.example.com/img.png） */
const isProtocolRelativeUrl = (url: string): boolean => url.startsWith('//');

/** 去除末尾斜杠，空串原样返回 */
const trimTrailingSlash = (url: string): string =>
  url ? url.replace(/\/+$/, '') : url;

/** 去除开头斜杠 */
const stripLeadingSlash = (path: string): string => path.replace(/^\/+/, '');

/** 剥离 API 前缀，返回去除前缀后的路径 */
const stripApiPrefix = (path: string): string => {
  for (const prefix of API_PREFIXES) {
    if (path.startsWith(prefix)) return path.slice(prefix.length);
  }
  return path;
};

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
  // 1. 手动传入的 domain 优先级最高
  if (domain) return trimTrailingSlash(domain);

  // 2. 系统配置（后台动态配置）
  const siteConfigStore = useSiteConfigStore();
  const configStaticUrl = siteConfigStore.getCurrentConfig().static_url;
  if (configStaticUrl) return trimTrailingSlash(configStaticUrl);

  // 3. 环境变量
  const envStaticUrl = import.meta.env.VITE_STATIC_URL;
  if (!envStaticUrl || envStaticUrl.trim() === '') return '';
  if (envStaticUrl === 'useCurrentDomain') return window.location.origin;
  return trimTrailingSlash(envStaticUrl);
};

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
export const buildStaticUrl = (
  path: string,
  domain?: string,
  addParams: boolean = true,
): string => {
  if (!path) return '';

  const trimmed = path.trim();

  // Data URL、Blob URL → 无需加工直接返回
  if (isDataUrl(trimmed) || isBlobUrl(trimmed)) return trimmed;

  // 私有空间：资源 key 交后端签发临时直链，前端不做任何拼接
  // （未就绪时返回 null，先按下方公开逻辑回落，拿到签名地址后重新渲染）
  const signedUrl = resolveSignedUrl(trimmed);
  if (signedUrl) return signedUrl;

  // 完整 URL、协议相对 URL → 无需加工直接返回
  if (isFullUrl(trimmed)) return addParams ? addCdnParams(trimmed) : trimmed;
  if (isProtocolRelativeUrl(trimmed)) return trimmed;

  const baseUrl = getStaticBaseUrl(domain);
  const cleaned = stripLeadingSlash(trimmed);

  // 同域访问：返回以 / 开头的相对路径
  if (!baseUrl) return `/${cleaned}`;

  // CDN 访问：拼接完整 URL
  const fullUrl = `${baseUrl}/${cleaned}`;
  return addParams ? addCdnParams(fullUrl) : fullUrl;
};

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
export const buildStaticUrls = (
  paths: string | string[],
  domain?: string,
): string[] => {
  if (typeof paths === 'string') {
    return paths
      .split(',')
      .filter(Boolean)
      .map((p) => buildStaticUrl(p.trim(), domain));
  }
  return paths.filter(Boolean).map((p) => buildStaticUrl(p, domain));
};

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
  if (!url) return '';

  // Data / Blob URL，直接返回
  if (isDataUrl(url) || isBlobUrl(url)) return url;

  const siteConfigStore = useSiteConfigStore();
  const baseDomain =
    domain || siteConfigStore.getCurrentConfig().cdnUrl || getStaticBaseUrl();

  // 如果有指定的域名，尝试移除
  if (baseDomain) {
    const normalizedDomain = trimTrailingSlash(baseDomain);
    let result = url
      .replace(
        new RegExp(String.raw`^https?:\/\/${escapeRegex(normalizedDomain)}\/?`),
        '',
      )
      .replace(
        new RegExp(String.raw`^${escapeRegex(normalizedDomain)}\/?`),
        '',
      );

    // 移除 CDN 参数（如果来自同一 CDN）
    const cfg = siteConfigStore.getCurrentConfig();
    if (normalizedDomain === cfg.cdnUrl && cfg.cdnUrlParams) {
      const paramStr = `[?&]${escapeRegex(cfg.cdnUrlParams)}`;
      result = result.replace(new RegExp(`${paramStr}(?:&|$)`), '');
    }

    url = result;
  }

  // 完整 URL → 用 URL API 提取路径
  if (isFullUrl(url)) {
    try {
      const path = stripApiPrefix(new URL(url).pathname);
      return stripLeadingSlash(path);
    } catch {
      return url;
    }
  }

  // 相对路径 → 剥离 API 前缀
  return stripLeadingSlash(stripApiPrefix(url));
};

/** 转义正则特殊字符 */
const escapeRegex = (str: string): string =>
  str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/**
 * 检查当前是否使用 CDN 模式
 *
 * @returns true 表示使用 CDN，false 表示同域访问
 */
export const isCdnMode = (): boolean => {
  const baseUrl = getStaticBaseUrl();
  return baseUrl !== '';
};

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
  return getStaticBaseUrl(domain);
};

/**
 * 添加 CDN URL 参数
 *
 * @param url 基础 URL
 * @returns 添加参数后的 URL
 */
const addCdnParams = (url: string): string => {
  const siteConfigStore = useSiteConfigStore();
  const cdnUrl = siteConfigStore.getCurrentConfig().cdnUrl;
  const cdnParams = siteConfigStore.getCurrentConfig().cdnUrlParams;

  // 只有当使用 CDN 且配置了参数时才添加
  if (!cdnUrl || !cdnParams || !url.includes(cdnUrl)) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${cdnParams}`;
};

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
  return [base.replace(/\/+$/, ''), ...paths.map((p) => p.replace(/^\/+/, ''))]
    .filter(Boolean)
    .join('/');
};

// ============================================================================
// 导出别名，方便使用
// ============================================================================
export const staticUrl = buildStaticUrl;
export const staticUrls = buildStaticUrls;
