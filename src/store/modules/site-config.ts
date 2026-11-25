import { ref } from 'vue'

// src/store/modules/site-config.ts
import { defineStore } from 'pinia'

import { getSiteInfoApi } from '#/api'
import { getInitialPreferences, setPreferences } from '#/core/preferences'
import { buildStaticUrl } from '#/utils/url'
import { prefetchSignedUrls } from '#/utils/url/private-storage'

// 定义站点配置接口（单份平台站点配置）
// 配置来源：GET /auth/site-info（登录前匿名可访问，两端同名）
// SaaS 取平台分组，标准版取 default 分组的 site_setting，字段一致。
// 注意：不能用 /system/config/code/site_setting（adminapi 端 requireToken=true，
// 登录前匿名请求必然 401 → 触发重新认证 → 500 兜底页死锁）。
interface SystemConfig {
  logo?: string // 站点Logo（来自后端 site_logo）
  title?: string // 站点名称（来自后端 site_name）
  favicon?: string // 站点图标（来自后端 site_favicon）
  copyright?: string // 版权信息（来自后端 site_copyright）
  static_url?: string // 静态资源base URL（CDN配置）
  cdnUrl?: string // 兼容旧版CDN URL
  cdnUrlParams?: string // CDN URL参数
  site_open?: number
  site_url?: string
  site_description?: string
  site_record_no?: string
  site_icp_url?: string
  site_network_security?: string
  site_network_security_url?: string
  [key: string]: any // 保留后端原始字段
}

const DEFAULT_LOGO = '/logo.png'
const DEFAULT_FAVICON = '/favicon.ico'

/** 后端空配置可能是 null / [] / 非对象，统一归一化为普通对象 */
function normalizeSource(source: unknown): Record<string, any> {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return {}
  }
  return source as Record<string, any>
}

/**
 * 站点配置映射函数
 * 将后端 snake_case 字段映射为前端 camelCase
 */
function mapSiteConfig(source: unknown): SystemConfig {
  const config = normalizeSource(source)
  return {
    logo: config.site_logo || '',
    title: config.site_name || '',
    favicon: config.site_favicon || '',
    copyright: config.site_copyright || '',
    site_open: config.site_open,
    site_url: config.site_url,
    site_description: config.site_description,
    site_record_no: config.site_record_no,
    site_icp_url: config.site_icp_url,
    site_network_security: config.site_network_security,
    site_network_security_url: config.site_network_security_url,
    // 保留其他所有字段（如 static_url, cdnUrl, cdnUrlParams 等）
    ...config
  }
}

/**
 * 站点配置状态管理（单份平台站点配置）
 *
 * 剥离多租户后，站点配置统一为单份（标识 default），
 * 登录前后共用 GET /system/config/code/site_setting，不再区分接口。
 */
export const useSiteConfigStore = defineStore('siteConfig', () => {
  // 在首次 setPreferences 前锁定 env 兜底值：defu 初始化让 state.app/logo 与
  // initialPreferences 共享嵌套引用，后续写入动态品牌会污染 initial 值。
  const initialBrand = getInitialPreferences()
  const envTitle = initialBrand.app?.name || ''
  const envLogo = initialBrand.logo?.source || DEFAULT_LOGO
  const envLogoDark = initialBrand.logo?.sourceDark || envLogo

  // ==================== 状态 ====================

  // 单份平台站点配置（默认标识 default）
  // 生命周期：bootstrap → 整个会话（退出不清空，登录页复用品牌）
  const platformConfig = ref<SystemConfig>({})
  const platformLoading = ref(false)
  const platformIsLoaded = ref(false)
  const platformError = ref<null | string>(null)

  // ==================== Actions ====================

  /**
   * 写入 index.html 首屏脚本使用的品牌缓存。
   * 空响应/失败也要覆盖：写空字符串后首屏回退 env 标题与内置 favicon。
   */
  const writePlatformCache = (config: SystemConfig) => {
    try {
      const primaryColor = config.primaryColor || config.site_primary_color || config.primary_color
      const cacheData: Record<string, any> = {
        title: config.title || '',
        logo: config.logo || '',
        // favicon 未配置时回落动态 Logo，两者都没有则写空，由首屏脚本回退内置图标
        favicon: config.favicon || config.logo || ''
      }
      if (primaryColor) {
        cacheData.primaryColor = primaryColor
      }
      localStorage.setItem('__site_config__', JSON.stringify(cacheData))
    } catch {
      // 忽略缓存写入失败
    }
  }

  /**
   * 获取站点配置（登录前后统一入口，无需 Token）
   * GET /auth/site-info（两端同名匿名接口，登录前不会 401）
   * 空响应或请求失败都按空配置覆盖，避免残留旧品牌。
   *
   * @param force 为 true 时忽略已加载状态强制重新拉取（保存配置后刷新用）
   */
  const fetchPlatformConfig = async (force = false) => {
    if (platformLoading.value) return
    if (platformIsLoaded.value && !force) return
    platformLoading.value = true
    platformError.value = null

    try {
      // getSiteInfoApi 带 skipGlobalErrorHandler：本方法内部已 try/catch 优雅降级
      const response = (await getSiteInfoApi()) as any
      platformConfig.value = mapSiteConfig(response)
    } catch (error: any) {
      platformConfig.value = mapSiteConfig({})
      platformError.value = error?.message || '获取站点信息失败'
      console.warn('获取平台配置失败，按空配置处理（不影响登录）:', error)
    } finally {
      platformIsLoaded.value = true
      writePlatformCache(platformConfig.value)
      platformLoading.value = false
    }
  }

  /**
   * 将当前站点配置应用到 preferences（logo/标题/favicon）
   * 配置为空时回退到 env 初始化偏好，不保留旧品牌；不发起请求，仅做状态同步。
   */
  const applyToPreferences = async () => {
    const config = getCurrentConfig()
    const title = config.title || envTitle
    const defaultLogo = envLogo
    const defaultLogoDark = envLogoDark

    // 私有空间下 logo/favicon 需先换取签名地址，再写入 preferences（一次性写入，无法后续重算）
    try {
      await prefetchSignedUrls([config.logo, config.favicon])
    } catch (error) {
      console.warn('换取品牌资源签名地址失败，回退普通地址:', error)
    }

    const dynamicLogoUrl = config.logo ? buildStaticUrl(config.logo) : ''
    const logoUrl = dynamicLogoUrl || defaultLogo
    // favicon → 动态 Logo → 前端内置 /favicon.ico
    const dynamicFaviconUrl = config.favicon ? buildStaticUrl(config.favicon) : dynamicLogoUrl
    const faviconUrl = dynamicFaviconUrl || DEFAULT_FAVICON

    setPreferences({
      app: { name: title },
      logo: {
        source: logoUrl,
        sourceDark: dynamicLogoUrl || defaultLogoDark
      }
    })
    document.title = title

    // rel 含 icon token 的所有 link（icon / shortcut icon 等）一并替换，
    // 避免浏览器仍选中 index.html 里的默认 svg/ico 图标
    const iconLinks = document.querySelectorAll<HTMLLinkElement>(
      'link[rel~="icon"], link[rel="apple-touch-icon"]'
    )
    if (iconLinks.length > 0) {
      iconLinks.forEach((link) => {
        link.href = faviconUrl
        // 原 link 声明了 svg/ico 的 type，换图后移除由浏览器自行嗅探
        link.removeAttribute('type')
      })
    } else {
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = faviconUrl
      document.head.append(link)
    }
  }

  /**
   * 重置所有配置（退出登录时调用）
   * 品牌显示立即回退到 env，避免登录页短暂显示旧品牌。
   */
  const resetConfig = () => {
    platformConfig.value = {}
    platformError.value = null
    platformIsLoaded.value = false
    // 清理内存后，同时清除 localStorage 缓存
    try {
      localStorage.removeItem('__site_config__')
    } catch {
      // 忽略清理失败
    }
    void applyToPreferences().catch((error) => {
      console.warn('恢复默认品牌失败:', error)
    })
  }

  // resetAllStores() 依赖 $reset()；单份配置模式下清空即可
  const $reset = resetConfig

  /**
   * 获取当前有效配置
   * 用于 App.vue 动态更新 document.title / favicon
   */
  const getCurrentConfig = (): SystemConfig => {
    return platformConfig.value
  }

  /**
   * 重新拉取站点配置并同步到 preferences（logo/标题/favicon）
   * 供 settings 保存后、登录成功后调用
   *
   * 内部已做异常保护，不会因配置获取失败而中断调用方流程
   */
  const syncTenantPreferences = async () => {
    try {
      // 强制重新拉取，保证保存配置 / 登录后拿到最新内容
      await fetchPlatformConfig(true)
    } catch {
      console.warn('获取站点配置失败，按空配置处理')
    }
    try {
      // 即使配置为空也要应用一次：旧品牌必须被 env 兜底值覆盖
      await applyToPreferences()
    } catch (error) {
      console.warn('应用站点品牌配置失败:', error)
    }
  }

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
    $reset
  }
})
