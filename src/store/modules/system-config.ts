// src/store/modules/system-config.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/http'

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
        const response = await request.get<SystemConfig>({
          url: '/sys/getSystemConfig'
        })

        config.value = response || {}
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
