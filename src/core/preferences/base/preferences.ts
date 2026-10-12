import type {
  CustomPreferencesRecord,
  DeepPartial,
  InitialOptions,
  Preferences,
  PreferencesExtension,
} from './types';

import { markRaw, reactive, readonly } from 'vue';

import { merge } from '#/core/shared/utils';

import { defaultPreferences } from './config';

const STORAGE_KEY = 'preferences';

/**
 * 精简版偏好管理器
 *
 * 容器（布局/主题）由 app 容器层负责，因此这里不做 CSS 变量联动、
 * 不做自定义偏好扩展，仅保留业务代码读写偏好（locale/name/accessMode/
 * defaultHomePath/logo 等）所需的响应式状态与本地持久化能力。
 */
class PreferenceManager {
  private customState = reactive<CustomPreferencesRecord>({});
  private customPreferencesExtension: null | PreferencesExtension<any> = null;
  private initialPreferences: Preferences = defaultPreferences;
  private isInitialized = false;
  private namespace = '';
  private state: Preferences;

  constructor() {
    this.state = reactive<Preferences>(
      merge({}, defaultPreferences),
    ) as Preferences;
  }

  getCustomPreferences = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return readonly(this.customState) as Readonly<TCustomPreferences>;
  };

  getInitialCustomPreferences = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return {} as Readonly<TCustomPreferences>;
  };

  getInitialPreferences = () => {
    return this.initialPreferences;
  };

  getPreferences = () => {
    return readonly(this.state);
  };

  getPreferencesExtension = <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >() => {
    return (this.customPreferencesExtension ?? null) as Readonly<
      PreferencesExtension<TCustomPreferences>
    > | null;
  };

  initPreferences = async <
    TCustomPreferences extends object = CustomPreferencesRecord,
  >({
    namespace,
    overrides = {},
    extension = null,
  }: InitialOptions<TCustomPreferences>) => {
    if (this.isInitialized) {
      return;
    }

    this.namespace = namespace;
    this.customPreferencesExtension = extension;

    // overrides 覆盖默认值
    this.initialPreferences = merge(
      {},
      markRaw(overrides),
      defaultPreferences,
    ) as Preferences;

    // 缓存优先（用户在设置面板中的修改），initial 补齐缺失字段
    const cached = this.loadFromCache();
    const merged = merge(
      {},
      cached ?? {},
      this.initialPreferences,
    ) as Preferences;

    Object.assign(this.state, merged);
    this.saveToCache();
    this.isInitialized = true;
  };

  resetPreferences = async () => {
    Object.assign(this.state, this.initialPreferences);
    this.saveToCache();
  };

  clearCache = async () => {
    try {
      localStorage.removeItem(this.storageKey());
    } catch {
      // ignore
    }
  };

  /**
   * 强制覆盖（逐字段赋值，绕过 defu 的补齐语义）
   */
  setPreferences = (updates: DeepPartial<Preferences>) => {
    if (updates.app) {
      Object.assign(this.state.app, updates.app);
    }
    if (updates.logo) {
      Object.assign(this.state.logo, updates.logo);
    }
    for (const key of Object.keys(updates)) {
      if (key === 'app' || key === 'logo') continue;
      (this.state as any)[key] = (updates as any)[key];
    }
    this.saveToCache();
  };

  updateCustomPreferences = (_updates: DeepPartial<object>) => {};

  /**
   * 深度合并更新（defu 语义：传入字段优先）
   */
  updatePreferences = (updates: DeepPartial<Preferences>) => {
    const merged = merge(
      {},
      markRaw(updates),
      markRaw(this.state),
    ) as Preferences;
    Object.assign(this.state, merged);
    this.saveToCache();
  };

  private loadFromCache(): Preferences | null {
    try {
      const raw = localStorage.getItem(this.storageKey());
      return raw ? (JSON.parse(raw) as Preferences) : null;
    } catch {
      return null;
    }
  }

  private saveToCache() {
    if (!this.isInitialized) return;
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.state));
    } catch {
      // ignore
    }
  }

  private storageKey() {
    return `${this.namespace}-${STORAGE_KEY}`;
  }
}

const preferencesManager = new PreferenceManager();

export { PreferenceManager, preferencesManager };
