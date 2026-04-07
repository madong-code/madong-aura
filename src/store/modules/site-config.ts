// src/store/modules/system-config.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ConfigService } from '@/api/setting/config/config'

// 定义系统配置接口
interface SystemConfig {
  logo?: string
  title?: string
  favicon?: string
  copyright?: string
  [key: string]: any // 允许其他自定义字段
}

/**
 * 系统配置状态管理
 * 管理网站的Logo、名称等配置信息
 */
export const useSystemConfigStore = defineStore('systemConfig', () => {
  // 系统配置信息
  const config = ref<SystemConfig>({})

  // 加载状态
  const loading = ref(false)

  // 错误信息
  const error = ref<string | null>(null)

  // 是否已从服务器加载
  const isLoaded = ref(false)

  /**
   * 获取系统配置（使用 code 获取）
   * @param code 配置编码，默认为 'site_setting'
   */
  const fetchSystemConfig = async (code = 'site_setting') => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const response = await ConfigService.getByCode(code) as any

      // 格式化配置数据，将接口返回的字段映射到统一的字段名
      const formattedConfig: SystemConfig = {
        logo: response?.site_logo || '',
        title: response?.site_name || '',
        favicon: response?.site_favicon || '',
        copyright: response?.site_copyright || '',
        site_open: response?.site_open,
        site_url: response?.site_url,
        site_network_security: response?.site_network_security,
        site_record_no: response?.site_record_no,
        site_icp_url: response?.site_icp_url,
        site_network_security_url: response?.site_network_security_url,
        site_description: response?.site_description,
        // 保留其他所有字段
        ...response
      }

      config.value = formattedConfig
      isLoaded.value = true
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
    isLoaded.value = false
  }

  return {
    config,
    loading,
    error,
    isLoaded,
    fetchSystemConfig,
    updateSystemConfig,
    getConfigItem,
    resetConfig
  }
})
