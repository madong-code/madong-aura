// src/store/modules/dict.ts
import { defineStore } from 'pinia'
import request from '@/utils/http'
import { Option } from '@/types'
type NewOption = Option & { 
  bgColor?: string
  textColor?: string }
// 定义字典项的接口
interface DictItem {
  name: string
  dictItemValue: string | number
  dictItemKey: string
  bgColor?: string
  textColor?: string
  disabled?: boolean
}

// 定义字典的接口
interface Dict {
  name: string
  dictKey: string
  items: DictItem[]
}

interface DictState {
  dictMap: Map<string, NewOption[]>
  loadingMap: Map<string, boolean>
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: new Map<string, NewOption[]>(),
    loadingMap: new Map<string, boolean>()
  }),

  actions: {
    async getDictByType(dictType: string): Promise<NewOption[]> {
      // 如果已经存在缓存，直接返回
      if (this.dictMap.has(dictType)) {
        return this.dictMap.get(dictType) || []
      }

      // 如果正在加载中，等待一段时间后再次尝试获取
      if (this.loadingMap.get(dictType)) {
        // 简单等待机制，可以使用更复杂的等待逻辑
        await new Promise((resolve) => setTimeout(resolve, 10))
        return this.getDictByType(dictType)
      }

      // 标记为正在加载
      this.loadingMap.set(dictType, true)

      try {
        const res = await request.post<NewOption[]>({
          url: '/sys/dict/getByDictType',
          params: { dictType }
        })

        const data = res || []
        // 缓存数据
        this.dictMap.set(dictType, data)
        return data
      } finally {
        // 加载完成后清除标记
        this.loadingMap.set(dictType, false)
      }
    },

    // 初始化所有字典数据 - 适配新的数据结构
    async initAllDicts(apiFun: () => Promise<Dict[]>): Promise<void> {
      try {
        // 调用传入的API函数获取所有字典数据
        const allDicts = await apiFun()

        // 将获取到的所有字典数据转换并存入缓存
        allDicts.forEach((dict) => {
          // 将 DictItem 转换为 Option 格式
          const options: NewOption[] = dict.items.map((item) => ({
            label: item.name,
            value: item.dictItemValue,
            disabled: item.disabled ? true: false,
            bgColor: item.bgColor,
            textColor: item.textColor,
          }))

          // 以 dictKey 作为键存储
          this.dictMap.set(dict.dictKey, options)
        })
      } catch (error) {
        console.error('初始化所有字典数据失败:', error)
        throw error
      }
    },

    // 清除特定字典类型的缓存
    clearDictCache(dictType: string) {
      this.dictMap.delete(dictType)
      this.loadingMap.delete(dictType)
    },

    // 清除所有缓存
    clearAllCache() {
      this.dictMap.clear()
      this.loadingMap.clear()
    }
  }
})
