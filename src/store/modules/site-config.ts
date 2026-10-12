import { ref } from 'vue';

// src/store/modules/site-config.ts
import { defineStore } from 'pinia';

import { ConfigService } from '#/api/system/config';
import { setPreferences } from '#/core/preferences';
import { buildStaticUrl } from '#/utils/url';
import { prefetchSignedUrls } from '#/utils/url/private-storage';

// 站点配置的分组与编码（与后端 config 表一致）
const SITE_GROUP_CODE = 'default';
const SITE_CODE = 'site_setting';

// 定义站点配置接口（单份平台站点配置，剥离多租户后无租户维度）
// 配置来源：GET /system/config/code/site_setting?group_code=default
// 该接口已标记为匿名可访问，登录前 / 登录后均走同一个接口与同一份数据
interface SystemConfig {
  logo?: string; // 站点Logo（来自后端 site_logo）
  title?: string; // 站点名称（来自后端 site_name）
  favicon?: string; // 站点图标（来自后端 site_favicon）
  copyright?: string; // 版权信息（来自后端 site_copyright）
  static_url?: string; // 静态资源base URL（CDN配置）
  cdnUrl?: string; // 兼容旧版CDN URL
  cdnUrlParams?: string; // CDN URL参数
  site_open?: number;
  site_url?: string;
  site_description?: string;
  site_record_no?: string;
  site_icp_url?: string;
  site_network_security?: string;
  site_network_security_url?: string;
  [key: string]: any; // 保留后端原始字段
}

/**
 * 站点配置映射函数
 * 将后端 snake_case 字段映射为前端 camelCase
 * 平台和租户共用同一个映射，只是数据源不同
 */
function mapSiteConfig(source: Record<string, any>): SystemConfig {
  return {
    logo: source?.site_logo || '',
    title: source?.site_name || '',
    favicon: source?.site_favicon || '',
    copyright: source?.site_copyright || '',
    site_open: source?.site_open,
    site_url: source?.site_url,
    site_description: source?.site_description,
    site_record_no: source?.site_record_no,
    site_icp_url: source?.site_icp_url,
    site_network_security: source?.site_network_security,
    site_network_security_url: source?.site_network_security_url,
    // 保留其他所有字段（如 static_url, cdnUrl, cdnUrlParams 等）
    ...source,
  };
}

/**
 * 站点配置状态管理（单份平台站点配置）
 *
 * 剥离多租户后，站点配置统一为单份（标识 default），
 * 登录前后共用 GET /system/config/code/site_setting，不再区分接口。
 */
export const useSiteConfigStore = defineStore('siteConfig', () => {
  // ==================== 状态 ====================

  // 单份平台站点配置（默认标识 default）
  // 生命周期：bootstrap → 整个会话（退出不清空，登录页复用品牌）
  const platformConfig = ref<SystemConfig>({});
  const platformLoading = ref(false);
  const platformIsLoaded = ref(false);
  const platformError = ref<null | string>(null);

  // ==================== Actions ====================

  /**
   * 获取站点配置（登录前后统一入口，无需 Token）
   * GET /system/config/code/site_setting?group_code=default
   *
   * @param force 为 true 时忽略已加载状态强制重新拉取（保存配置后刷新用）
   */
  const fetchPlatformConfig = async (force = false) => {
    if (platformLoading.value) return;
    if (platformIsLoaded.value && !force) return;
    platformLoading.value = true;
    platformError.value = null;

    try {
      const response = (await ConfigService.getByCode(SITE_CODE, {
        group_code: SITE_GROUP_CODE,
      })) as any;
      platformConfig.value = mapSiteConfig(response as any);
      platformIsLoaded.value = true;

      // 缓存到 localStorage，供 loading.html 在下次启动时读取
      // 有配置值才缓存，无则不存（loading.html 读取不到就不会设置，保留硬编码 fallback）
      try {
        const primaryColor =
          platformConfig.value.primaryColor ||
          platformConfig.value.site_primary_color ||
          platformConfig.value.primary_color;
        const cacheData: Record<string, any> = {
          title: platformConfig.value.title,
          logo: platformConfig.value.logo,
          favicon: platformConfig.value.favicon,
        };
        if (primaryColor) {
          cacheData.primaryColor = primaryColor;
        }
        localStorage.setItem('__site_config__', JSON.stringify(cacheData));
      } catch {
        // 忽略缓存写入失败
      }
    } catch (error: any) {
      platformError.value = error.message || '获取站点信息失败';
      console.warn('获取平台配置失败（不影响登录）:', error);
    } finally {
      platformLoading.value = false;
    }
  };

  /**
   * 重置所有配置（退出登录时调用）
   */
  const resetConfig = () => {
    platformConfig.value = {};
    platformError.value = null;
    platformIsLoaded.value = false;
    // 清理内存后，同时清除 localStorage 缓存
    try {
      localStorage.removeItem('__site_config__');
    } catch {
      // 忽略清理失败
    }
  };

  // resetAllStores() 依赖 $reset()；单份配置模式下清空即可
  const $reset = resetConfig;

  /**
   * 获取当前有效配置
   * 用于 App.vue 动态更新 document.title / favicon
   */
  const getCurrentConfig = (): SystemConfig => {
    return platformConfig.value;
  };

  /**
   * 将当前 store 中的站点配置应用到 preferences（logo/标题/favicon）
   * 不发起请求，仅做状态同步
   */
  const applyToPreferences = async () => {
    const config = getCurrentConfig();
    if (!config.title && !config.logo) {
      return; // 无可用配置，跳过同步
    }

    const updates: Record<string, any> = {};
    if (config.title) updates.app = { name: config.title };
    // 私有空间下 logo/favicon 需先向后台换取签名地址，再写入 preferences（一次性写入，无法后续重算）
    await prefetchSignedUrls([config.logo, config.favicon]);
    // logo 通过 buildStaticUrl 处理：同域使用相对路径，CDN 自动拼接域名，私有空间取签名地址
    const logoUrl = buildStaticUrl(config.logo || '');
    updates.logo = {
      source: logoUrl || '/logo.png',
      sourceDark: logoUrl || '/logo.png',
    };
    // 使用 setPreferences（直接覆盖已有字段），覆盖 env 写入的默认 app.name/logo.source
    setPreferences(updates);
    if (config.favicon) {
      const faviconLink =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (faviconLink) {
        faviconLink.href = buildStaticUrl(config.favicon);
      }
    }
  };

  /**
   * 重新拉取站点配置并同步到 preferences（logo/标题/favicon）
   * 供 settings 保存后、登录成功后调用
   *
   * 内部已做异常保护，不会因配置获取失败而中断调用方流程
   */
  const syncTenantPreferences = async () => {
    try {
      // 强制重新拉取，保证保存配置 / 登录后拿到最新内容
      await fetchPlatformConfig(true);
    } catch {
      console.warn('获取站点配置失败，沿用已有配置');
    }
    await applyToPreferences();
  };

  return {
    platformConfig,
    platformLoading,
    platformIsLoaded,
    platformError,
    fetchPlatformConfig,
    // 语义化别名：登录前后统一使用同一份站点配置
    fetchSiteConfig: fetchPlatformConfig,
    resetConfig,
    getCurrentConfig,
    applyToPreferences,
    syncTenantPreferences,
    // 语义化别名：拉取最新站点配置并同步到 preferences
    syncSitePreferences: syncTenantPreferences,
    $reset,
  };
});
