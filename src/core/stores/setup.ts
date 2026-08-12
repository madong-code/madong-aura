import type { Pinia } from 'pinia';

import type { App } from 'vue';

import { createPinia } from 'pinia';
import SecureLS from 'secure-ls';

let pinia: Pinia;

type SecureLSStorage = {
  get(key: string): any;
  set(key: string, value: unknown): void;
};

type SecureLSCtor = new (config?: {
  encodingType?: string;
  encryptionSecret?: string;
  isCompression?: boolean;
  metaKey?: string;
}) => SecureLSStorage;

const secureLSModule = SecureLS as unknown as {
  default?: SecureLSCtor;
  SecureLS?: SecureLSCtor;
};

const SecureLSConstructor =
  secureLSModule.default ??
  secureLSModule.SecureLS ??
  (SecureLS as unknown as SecureLSCtor);

/**
 * 【art-admin 改造 · store/stores 合并】
 *
 * 原先存在两个 pinia 来源：`core/store`（art 壳自己 createPinia 并注册
 * StorageKeyManager 持久化）与 `core/stores`（admin 业务层）。本次合并为唯一
 * 来源 `core/stores`，由本模块统一创建并注册持久化插件：
 *   - SecureLS 加密持久化（admin 业务 store）
 *   - StorageKeyManager 版本化 localStorage 持久化（art 壳 UI 状态：菜单/设置/标签页）
 * 避免两个 pinia 实例导致状态互相读不到，也消除重复的 store 目录。
 */
export const store: Pinia = createPinia();

export interface InitStoreOptions {
  /**
   * @zh_CN 应用名,由于 #/core/stores 是公用的，后续可能有多个app，为了防止多个app缓存冲突，可在这里配置应用名,应用名将被用于持久化的前缀
   */
  namespace: string;
  /**
   * @zh_CN 复用已存在的 pinia 实例（合并后一般传 core/stores 的 store）。
   */
  pinia?: Pinia;
}

/**
 * @zh_CN 初始化pinia
 */
export async function initStores(app: App, options: InitStoreOptions) {
  const { createPersistedState } = await import('pinia-plugin-persistedstate');
  pinia = options.pinia ?? store;
  const { namespace } = options;
  // 无论是否复用外部 pinia（art-admin 复用共享 store），都要注册持久化插件，
  // 否则 admin 业务 store（如 core-access）的 persist 配置不会生效，
  // 登录 token 无法写入 localStorage，刷新页面后即回到登录页。
  const ls = new SecureLSConstructor({
    encodingType: 'aes',
    encryptionSecret: import.meta.env.VITE_APP_STORE_SECURE_KEY,
    isCompression: true,
    metaKey: `${namespace}-secure-meta`,
  });
  pinia.use(
    createPersistedState({
      // key $appName-$store.id
      key: (storeKey) => `${namespace}-${storeKey}`,
      storage: import.meta.env.DEV
        ? localStorage
        : {
            getItem(key) {
              return ls.get(key);
            },
            setItem(key, value) {
              ls.set(key, value);
            },
          },
    }),
  );
  // 说明：art 壳 UI 状态 store（menu/setting/tabbar/worktab 等）各自在
  // persist 配置里指定了 key 与 storage，admin store（core-access 等）使用
  // 上面的全局 key 函数 `${namespace}-${storeId}`。两者都由上面注册的
  // pinia-plugin-persistedstate 统一处理，无需再单独注册 StorageKeyManager
  //（它是存储键生成器类，不是 pinia 插件，直接 pinia.use 会抛错）。
  app.use(pinia);
  return pinia;
}

export function resetAllStores() {
  if (!pinia) {
    console.error('Pinia is not installed');
    return;
  }
  const allStores = (pinia as any)._s;
  for (const [key, store] of allStores) {
    // art-admin：art 壳与 admin 业务层共用同一个 pinia，
    // art 侧存在用 setup 语法且未自定义 $reset 的 store（如 menuStore）。
    // pinia 对这类 store 调用 $reset() 会直接抛错，进而中断整个登出流程，
    // 因此这里逐个隔离，缺失 $reset 的 store 跳过而非让异常冒泡。
    try {
      store.$reset();
    } catch (error) {
      console.warn(`[resetAllStores] store "${key}" 无法重置，已跳过`, error);
    }
  }
}
