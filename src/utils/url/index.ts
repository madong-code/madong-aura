import { getApiBaseUrl } from "@/api/request";
import { useSystemConfigStore } from "@/store/modules/system-config";

/**
 * 获取资源完整地址（自动拼接CDN域名和参数）
 * @param relativeUrl 相对路径或完整URL
 * @param domain 可选自定义域名（默认使用站点CDN或当前域名）
 * @returns 完整的URL字符串
 */
export const fullUrl = (relativeUrl: string, domain: string = ''): string => {
    const siteConfig = useSystemConfigStore();

    // 1. 处理空路径直接返回域名
    if (!relativeUrl) return domain || getApiBaseUrl(null);

    // 2. 检测是否已经是完整URL或DataURL（正则合并优化）
    const isAbsoluteUrl = /^(https?:)?\/\//.test(relativeUrl);
    const isDataUrl = /^data:image\//i.test(relativeUrl);
    if (isAbsoluteUrl || isDataUrl) return relativeUrl;

    // 3. 确定最终使用的域名
    const finalDomain = domain || siteConfig?.config?.cdnUrl || getApiBaseUrl();
    if (!finalDomain) return relativeUrl; // 保底返回原路径

    // 4. 拼接URL
    let url = `${finalDomain.replace(/\/+$/, '')}/${relativeUrl.replace(/^\/+/, '')}`;

    // 5. 添加CDN参数（仅当使用站点CDN且存在参数时）
    if (
        finalDomain === siteConfig.config.cdn_url &&
        siteConfig.config.cdnUrlParams
    ) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}${siteConfig.config.cdnUrlParams}`;
    }

    return url;
};


/**
 * 移除URL中的公共路径前缀
 * @param url 待处理的URL
 * @param domain 可选指定要移除的特定域名（默认自动检测）
 * @returns 移除前缀后的相对路径
 */
export const stripBaseUrl = (url: string, domain: string = ''): string => {
    const siteConfig = useSystemConfigStore();

    // 1. 处理空值
    if (!url) return '';

    // 2. 检测不需要处理的URL类型
    const isDataUrl = /^data:image\//i.test(url);
    if (isDataUrl) return url;

    // 3. 确定要移除的域名（优先级：参数指定 > CDN域名 > API域名）
    const baseDomain = domain || siteConfig.config.cdnUrl || getApiBaseUrl();
    if (!baseDomain) return url;

    // 4. 标准化待移除的域名（移除尾部斜杠）
    const normalizedDomain = baseDomain.replace(/\/+$/, '');

    // 5. 移除域名部分（包括协议头可选匹配）
    let result = url
        .replace(new RegExp(`^https?:\\/\\/${normalizedDomain}\\/?`), '')
        .replace(new RegExp(`^${normalizedDomain}\\/?`), '');

    // 6. 移除可能的CDN参数（如果来自同一CDN）
    if (normalizedDomain === siteConfig.config.cdnUrl && siteConfig.config.cdnUrlParams) {
        const paramStr = `[?&]${siteConfig.config.cdnUrlParams.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
        result = result.replace(new RegExp(`${paramStr}(?:&|$)`), '');
    }

    // 7. 确保不会返回空路径（至少保留原文件名）
    return result || url.split('/').pop() || '';
};



/**
 * 获取一组资源的完整地址（支持字符串或数组输入）
 * @param relativeUrls 相对路径（支持逗号分隔字符串或数组）
 * @param domain 可选自定义域名（默认使用站点CDN或当前域名）
 * @returns 完整URL数组（自动过滤空值）
 */
export const arrayFullUrl = (
    relativeUrls: string | string[],
    domain: string = ''
): string[] => {
    // 1. 统一输入为数组格式（处理字符串输入）
    const urlArray = typeof relativeUrls === 'string'
        ? relativeUrls.split(',').filter(Boolean)
        : [...relativeUrls];

    // 2. 使用map批量处理URL（避免直接修改原数组）
    return urlArray.map(url => fullUrl(url.trim(), domain));
};


// 可以提取为通用工具函数
export const joinUrls = (base: string, ...paths: string[]) => {
    return [base.replace(/\/+$/, ''), ...paths.map(p => p.replace(/^\/+/, ''))]
        .filter(Boolean)
        .join('/');
};