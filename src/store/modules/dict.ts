// src/store/modules/dict.ts
import { defineStore } from 'pinia'
import request from '@/utils/http'
import { Option } from '@/types'

interface DictState {
  dictMap: Map<string, Option[]>
  loadingMap: Map<string, boolean>
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: new Map<string, Option[]>(),
    loadingMap: new Map<string, boolean>()
  }),

  actions: {
    async getDictByType(dictType: string): Promise<Option[]> {
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
        const res = await request.post<Option[]>({
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
