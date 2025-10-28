// src/store/modules/system-config.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/http'
import { ConfigService } from '@/api/system/config'

// 定义系统配置接口
interface SystemConfig {
  logo?: string
  title?: string
  favicon?: string
  copyright?: string
  cdnUrl?: string
  cdnUrlParams?: string
  [key: string]: any // 允许其他自定义字段
}

/**
 * 系统配置状态管理
 * 管理网站的Logo、名称等配置信息
 */
export const useSystemConfigStore = defineStore(
  'systemConfig',
  () => {
    // 系统配置信息
    const config = ref<SystemConfig>({})

    // 加载状态
    const loading = ref(false)

    // 错误信息
    const error = ref<string | null>(null)

    /**
     * 获取系统配置
     */
    const fetchSystemConfig = async () => {
      if (loading.value) return

      loading.value = true
      error.value = null

      try {
        const response = await ConfigService.get({ group_code: 'site_setting' });
        config.value = adaptSystemConfig(response)
      } catch (err: any) {
        error.value = err.message || '获取系统配置失败'
        console.error('获取系统配置失败:', err)
      } finally {
        loading.value = false
      }
    }

    /**
     * 更新系统配置（本地）
     * @param newConfig 新的配置信息
     */
    const updateSystemConfig = (newConfig: Partial<SystemConfig>) => {
      config.value = { ...config.value, ...newConfig }
    }

    /**
     * 获取特定配置项
     * @param key 配置项键名
     * @returns 配置项值
     */
    const getConfigItem = (key: string): any => {
      return config.value[key]
    }

    /**
     * 重置配置
     */
    const resetConfig = () => {
      config.value = {}
      error.value = null
    }

    /**
     * 将获取的配置格式化
     * @param apiData 
     * @returns 
     */
    const adaptSystemConfig = (apiData: any) => {
      if (!apiData) return {};
      const {
        site_open,
        site_url,
        site_name,
        site_logo,
        site_network_security,
        site_description,
        site_record_no,
        site_icp_url,
        site_network_security_url,
        cdn_url,
        cdn_url_params,
        ...rest
      } = apiData;
      return {
        logo: site_logo,
        title: site_name,
        favicon: site_logo, // favicon 缺省为 logo
        copyright: `© ${new Date().getFullYear()} ${site_name} | ${site_record_no}`,
        isOpen: site_open === "1",
        securityInfo: [site_network_security, site_network_security_url].filter(Boolean).join(' '),
        icpInfo: [site_record_no, site_icp_url].filter(Boolean).join(' '),
        cdnUrl: cdn_url,
        cdnUrlParams: cdn_url_params,
        ...rest,
      };
    };


    return {
      config,
      loading,
      error,
      fetchSystemConfig,
      updateSystemConfig,
      getConfigItem,
      resetConfig
    }
  },
  {
    // 添加持久化配置
    persist: {
      key: 'system-config',
      storage: localStorage
    }
  }
)
