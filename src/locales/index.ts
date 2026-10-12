import type { Language } from 'element-plus/es/locale';

import type { App } from 'vue';

import type {
  LocaleSetupOptions,
  SupportedLanguagesType,
} from '#/core/locales';

import { ref } from 'vue';

import dayjs from 'dayjs';
import enLocale from 'element-plus/es/locale/lang/en';
import defaultLocale from 'element-plus/es/locale/lang/zh-cn';

import {
  $t,
  i18n,
  loadLocaleMessages,
  setupI18n as coreSetup,
} from '#/core/locales';
import { preferences } from '#/core/preferences';

import { loadAllLocaleMessages } from './loader';
import artEn from './langs/en.json';
import artZh from './langs/zh.json';

/**
 * 统一 i18n 模块
 *
 * 容器层与业务层（madong）共用同一个 vue-i18n 实例
 * （#/core/locales）。容器语言包（src/locales/langs）合并进 madong
 * 消息体系；容器切换语言使用 'zh'/'en' 短码，这里为其注册消息别名，
 * madong 侧则统一使用 'zh-CN'/'en-US'。
 */

const elementLocale = ref<Language>(defaultLocale);

/** 容器短码 → madong 语言码 */
const LOCALE_ALIAS: Record<string, SupportedLanguagesType> = {
  en: 'en-US',
  'en-US': 'en-US',
  zh: 'zh-CN',
  'zh-CN': 'zh-CN',
};

function normalizeLocale(lang: string): SupportedLanguagesType {
  return LOCALE_ALIAS[lang] ?? 'zh-CN';
}

/** 语言切换下拉选项（保持容器短码，容器组件零改动） */
const languageOptions = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
];

async function loadDayjsLocale(lang: SupportedLanguagesType) {
  let locale;
  switch (lang) {
    case 'en-US': {
      locale = await import('dayjs/locale/en');
      break;
    }
    case 'zh-CN': {
      locale = await import('dayjs/locale/zh-cn');
      break;
    }
    default: {
      locale = await import('dayjs/locale/en');
    }
  }
  if (locale) {
    dayjs.locale(locale);
  }
}

function loadElementLocale(lang: SupportedLanguagesType) {
  elementLocale.value = lang === 'en-US' ? enLocale : defaultLocale;
}

async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([loadElementLocale(lang), loadDayjsLocale(lang)]);
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 仅挑选 preferred 中 existing 尚未覆盖的叶子 key（深比较）。
 * 保证 core/业务语言包优先，容器语言包只负责补齐容器自身需要的 key，
 * 避免同名文案被容器语言包覆盖（如 common.confirm：确认 → 确定）。
 */
function pickMissing(
  preferred: Record<string, any>,
  existing: Record<string, any>,
): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(preferred)) {
    if (!(key in existing)) {
      out[key] = value;
    } else if (isPlainObject(value) && isPlainObject(existing[key])) {
      const sub = pickMissing(value, existing[key]);
      if (Object.keys(sub).length > 0) out[key] = sub;
    }
  }
  return out;
}

/**
 * 语言包合并（优先级 core/业务 > art）：
 * 1. core 语言包已由 #/core/locales 先注册，art 只补 core 缺失的 key
 * 2. 业务语言包（locales/langs + lang + plugin）整体覆盖在最上层
 */
async function loadMessages(lang: SupportedLanguagesType) {
  await loadThirdPartyMessage(lang);
  const artMessages =
    lang === 'en-US'
      ? (artEn as Record<string, any>)
      : (artZh as Record<string, any>);
  const coreMessages = i18n.global.getLocaleMessage(lang) as Record<string, any>;
  const merged: Record<string, any> = pickMissing(artMessages, coreMessages);
  const businessMessages = loadAllLocaleMessages(lang);
  // 业务包深合并到顶层（loader 内部已按 langs → lang → plugin 排序）
  for (const [key, value] of Object.entries(businessMessages)) {
    if (isPlainObject(value) && isPlainObject(merged[key])) {
      mergeLeaf(merged[key] as Record<string, any>, value as Record<string, any>);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

function mergeLeaf(target: Record<string, any>, source: Record<string, any>) {
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      mergeLeaf(target[key] as Record<string, any>, value as Record<string, any>);
    } else {
      target[key] = value;
    }
  }
}

/**
 * 为 art 的短码注册与 madong 语言码相同的消息副本，
 * 保证容器切换到 'zh'/'en' 时翻译不丢失
 */
function registerLocaleAliases() {
  const zh = i18n.global.getLocaleMessage('zh-CN');
  const en = i18n.global.getLocaleMessage('en-US');
  i18n.global.setLocaleMessage('zh', zh);
  i18n.global.setLocaleMessage('en', en);
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  const initialLocale = preferences.app.locale;
  await coreSetup(app, {
    defaultLocale: initialLocale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });

  // 容器切换语言仅直接改写 i18n 的短码 locale（zh/en），不会触发消息加载。
  // 因此启动时需把两套规范语言消息全部加载完毕，再注册短码别名，
  // 否则默认中文启动时 'en' 别名永远是空消息对象。
  await loadLocaleMessages('en-US');
  await loadLocaleMessages('zh-CN');
  // 恢复偏好语言为当前激活语言（偏好若为短码，会同步补齐短码消息）
  await loadLocaleMessages(initialLocale);

  registerLocaleAliases();
}

/**
 * 界面语言切换统一入口
 *
 * 容器下拉使用短码 zh/en，而消息按规范码 zh-CN/en-US 加载。
 * 切换时主动（重新）加载规范语言消息、刷新短码别名，再切到短码 locale，
 * 避免只改 locale 值导致消息未就绪、文案显示为原始 key。
 */
async function changeLocale(lang: string) {
  const normalized = normalizeLocale(lang);
  await loadLocaleMessages(normalized);
  i18n.global.locale.value = lang as SupportedLanguagesType;
  registerLocaleAliases();
}

export default i18n;
export {
  $t,
  changeLocale,
  i18n,
  languageOptions,
  loadMessages,
  normalizeLocale,
  setupI18n,
};
export { loadLocaleMessages } from '#/core/locales';
export type { SupportedLanguagesType };
