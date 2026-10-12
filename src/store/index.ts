/**
 * Pinia Store 配置模块
 *
 * 提供全局状态管理的初始化和配置
 *
 * ## 主要功能
 *
 * - Pinia Store 实例创建
 * - 持久化插件配置（pinia-plugin-persistedstate）
 * - 版本化存储键管理
 * - 自动数据迁移（跨版本）
 * - LocalStorage 序列化配置
 * - Store 初始化函数
 *
 * ## 持久化策略
 *
 * - 使用 StorageKeyManager 生成版本化的存储键
 * - 格式：sys-v{version}-{storeId}
 * - 自动迁移旧版本数据到当前版本
 * - 使用 localStorage 作为存储介质
 *
 * @module store/index
 * @author Mr.April
 */
import type { App } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { StorageKeyManager } from '#/core/utils/storage/storage-key-manager'

export const store = createPinia()

/**
 * setup 语法 store（容器层的 menuStore/settingStore 等）没有可用的
 * $reset，resetAllStores()/登出流程遍历重置时会抛
 * "Store ... does not implement $reset()"。
 *
 * pinia 在插件执行「之前」就把抛错桩挂到 store.$reset 上（dev），
 * 桩本身 typeof === 'function'，不能用类型判断识别；
 * 这里通过函数源码特征判断是否为 pinia 抛错桩，命中才用「初始 $state
 * 快照 + $patch」替换。插件在 store 创建末尾同步执行，赋值经 reactive
 * proxy 写入后即生效（pinia 之后不会再重写 $reset）。
 *
 * - options store：内置 $reset，源码不命中，保留原语义
 * - setup store 手动 return $reset（auth/notify 等）：不命中，保留
 * - 生产环境 pinia 桩为 noop（不抛错），保持原样
 * 本插件先于持久化插件注册，快照取持久化恢复「之前」的真实初始状态。
 */
store.use(({ store: piniaStore }) => {
  const reset = (piniaStore as any).$reset as unknown
  if (typeof reset !== 'function') return
  if (!reset.toString().includes('does not implement $reset')) return

  const initialState = JSON.parse(JSON.stringify(piniaStore.$state))
  ;(piniaStore as any).$reset = () => {
    piniaStore.$patch(JSON.parse(JSON.stringify(initialState)))
  }
})

// 创建存储键管理器实例
const storageKeyManager = new StorageKeyManager()

// 容器层 store 的持久化 key（core-* 业务 store 由 #/core/stores 统一处理）
const APP_NOOP_KEY = '__app_noop__'

// 容器层 store 的持久化存储（core-* 业务 store 由 #/core/stores 统一处理）
const appScopedStorage: Storage = {
  getItem: (key: string) =>
    key === APP_NOOP_KEY ? null : localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    if (key === APP_NOOP_KEY) return
    localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    if (key === APP_NOOP_KEY) return
    localStorage.removeItem(key)
  },
  clear: () => localStorage.clear(),
  key: (index: number) => localStorage.key(index),
  length: 0
} as Storage

// 配置持久化插件
store.use(
  createPersistedState({
    key: (storeId: string) =>
      storeId.startsWith('core-')
        ? APP_NOOP_KEY
        : storageKeyManager.getStorageKey(storeId),
    storage: appScopedStorage as any,
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  })
)

/**
 * 初始化 Store
 */
export function initStore(app: App<Element>): void {
  app.use(store)
}

// 业务 store（madong，与容器层 store 共存于同一 pinia 实例）
export * from './auth'
export * from './modules/dict'
export * from './modules/notify'
export * from './modules/site-config'
export * from './modules/terminal'
