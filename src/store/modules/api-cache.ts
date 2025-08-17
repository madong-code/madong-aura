import type { Recordable } from '@/types'
import type { OptionsItem } from '@/components/form/api-component.vue'
import request from '@/utils/http'

// 缓存存储Map
const cacheStore = new Map<string, { data: any; timestamp: number; expireTime: number }>()
// 正在进行的请求Map，用于去重
const pendingRequests = new Map<string, Promise<any>>()

// 默认缓存过期时间（5分钟）
const DEFAULT_EXPIRE_TIME = 5 * 60 * 1000

// 生成缓存键
const generateCacheKey = (
  api: ((arg?: any) => Promise<any>) | string,
  params: Recordable | undefined,
  requestMethod: string | undefined
): string => {
  let url: string
  if (typeof api === 'function') {
    // 尝试从函数体中提取URL
    const functionString = api.toString()
    const urlMatch = functionString.match(/url:\s*["'](\/[^"']*)["']/)
    if (urlMatch && urlMatch[1]) {
      // 如果成功提取到URL，则使用该URL作为标识
      url = urlMatch[1]
    } else {
      // 否则回退到使用函数名或整个函数字符串
      url = functionString
    }
  } else {
    url = api
  }

  const keyObj = {
    url,
    params: params || {},
    method: requestMethod || 'get'
  }

  return JSON.stringify(keyObj)
}

// 清理过期缓存
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, item] of cacheStore.entries()) {
    if (now - item.timestamp > item.expireTime) {
      cacheStore.delete(key)
    }
  }
}

// 缓存装饰器函数
export const withCache = <
  T extends ((arg?: any) => Promise<OptionsItem[] | Record<string, any>>) | string
>(
  api?: T,
  options: {
    expireTime?: number
    params?: Recordable
    requestMethod?: 'get' | 'post'
  } = {}
) => {
  if (api === undefined) {
    return undefined // 改为返回undefined而不是Promise.resolve([])
  }
  const { expireTime = DEFAULT_EXPIRE_TIME, params, requestMethod = 'post' } = options

  // 定期清理过期缓存（每100次调用清理一次）
  if (Math.random() < 0.01) {
    cleanExpiredCache()
  }

  return async (requestParams?: Recordable): Promise<OptionsItem[] | Record<string, any>> => {
    const finalParams = requestParams || params
    const cacheKey = generateCacheKey(api, finalParams, requestMethod)

    // 检查是否存在有效缓存
    const cachedItem = cacheStore.get(cacheKey)
    if (cachedItem && Date.now() - cachedItem.timestamp < cachedItem.expireTime) {
      return cachedItem.data
    }

    // 检查是否已经有相同的请求正在进行中
    if (pendingRequests.has(cacheKey)) {
      // 如果有，则直接返回该请求的Promise，避免重复请求
      return pendingRequests.get(cacheKey)
    }

    // 没有缓存且没有正在进行的请求，创建新的请求Promise
    const requestPromise = (async () => {
      try {
        // 发起请求或执行函数
        let result: any
        if (typeof api === 'function') {
          // 对于函数类型的API，直接调用函数
          result = await api(finalParams)
        } else {
          // 对于字符串类型的API，发起HTTP请求
          const config = {
            url: api as string,
            method: requestMethod,
            params: finalParams
          }
          result = await request.request<any>(config)
        }

        // 存储到缓存
        cacheStore.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expireTime
        })

        return result
      } finally {
        // 请求完成后，从正在进行的请求Map中删除
        pendingRequests.delete(cacheKey)
      }
    })()

    // 将请求Promise添加到正在进行的请求Map中
    pendingRequests.set(cacheKey, requestPromise)

    // 返回请求Promise
    return requestPromise
  }
}

// 清除指定缓存
export const clearCache = (
  api: ((arg?: any) => Promise<any>) | string,
  params?: Recordable,
  requestMethod: 'get' | 'post' = 'get'
) => {
  const cacheKey = generateCacheKey(api, params, requestMethod)
  if (cacheKey) {
    cacheStore.delete(cacheKey)
    // 同时清除正在进行的请求
    pendingRequests.delete(cacheKey)
  }
}

// 清除所有缓存
export const clearAllCache = () => {
  cacheStore.clear()
  // 同时清除所有正在进行的请求
  pendingRequests.clear()
}
