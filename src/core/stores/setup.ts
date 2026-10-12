import type { Pinia } from 'pinia';

import type { App } from 'vue';

import { createPersistedState } from 'pinia-plugin-persistedstate';
import SecureLS from 'secure-ls';

import { store as sharedPinia } from '@/store';

let pinia: Pinia = sharedPinia;

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

export interface InitStoreOptions {
  /**
   * @zh_CN 应用名，持久化存储 key 的前缀，用于多应用隔离
   */
  namespace: string;
}

const NOOP_STORAGE_KEY = '__noop__';

function isCoreKey(prefix: string, key: string) {
  return key.startsWith(prefix) && !key.includes(NOOP_STORAGE_KEY);
}

/**
 * @zh_CN 初始化 pinia
 *
 * 与 app 容器层共用同一个 pinia 实例（@/store 中创建），
 * 仅追加 core-* store 的持久化策略：DEV 明文 localStorage，生产 AES 加密。
 * 容器自身的 store 由其原有插件负责，这里通过 storage no-op 跳过。
 */
export async function initStores(app: App, options: InitStoreOptions) {
  const { namespace } = options;
  const prefix = `${namespace}-`;

  const ls = new SecureLSConstructor({
    encodingType: 'aes',
    encryptionSecret: import.meta.env.VITE_APP_STORE_SECURE_KEY,
    isCompression: true,
    metaKey: `${namespace}-secure-meta`,
  });

  const secureStorage = {
    getItem(key: string) {
      if (!isCoreKey(prefix, key)) return null;
      return ls.get(key);
    },
    setItem(key: string, value: string) {
      if (!isCoreKey(prefix, key)) return;
      ls.set(key, value);
    },
    removeItem(key: string) {
      if (!isCoreKey(prefix, key)) return;
      (ls as any).remove?.(key);
    },
  };

  const plainStorage = {
    getItem(key: string) {
      if (!isCoreKey(prefix, key)) return null;
      return localStorage.getItem(key);
    },
    setItem(key: string, value: string) {
      if (!isCoreKey(prefix, key)) return;
      localStorage.setItem(key, value);
    },
    removeItem(key: string) {
      if (!isCoreKey(prefix, key)) return;
      localStorage.removeItem(key);
    },
  };

  pinia.use(
    createPersistedState({
      // 仅处理 core-* 开头的业务 store，其余 key 走 storage no-op
      key: (storeKey) =>
        storeKey.startsWith('core-')
          ? `${prefix}${storeKey}`
          : `${prefix}${NOOP_STORAGE_KEY}-${storeKey}`,
      storage: import.meta.env.DEV ? plainStorage : secureStorage,
    }),
  );

  app.use(pinia);
  return pinia;
}

export function resetAllStores() {
  if (!pinia) {
    console.error('Pinia is not installed');
    return;
  }
  const allStores = (pinia as any)._s as Map<string, any>;
  for (const [id, store] of allStores) {
    // 容器层 setup store 的 $reset 已在 @/store 插件中替换为快照重置；
    // 这里再兜底一次，避免单个 store 重置失败阻断登出/启动流程
    try {
      store.$reset();
    } catch (error) {
      console.warn(`[store] skip $reset for "${id}":`, error);
    }
  }
}

export { pinia };
