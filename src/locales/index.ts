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

import { $t, loadLocaleMessages, setupI18n as coreSetup } from '#/core/locales';
import { preferences } from '#/core/preferences';

import { loadAllLocaleMessages } from './loader';

const elementLocale = ref<Language>(defaultLocale);

async function loadMessages(lang: SupportedLanguagesType) {
  await loadThirdPartyMessage(lang);
  return loadAllLocaleMessages(lang);
}

async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([loadElementLocale(lang), loadDayjsLocale(lang)]);
}

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

async function loadElementLocale(lang: SupportedLanguagesType) {
  switch (lang) {
    case 'en-US': {
      elementLocale.value = enLocale;
      break;
    }
    case 'zh-CN': {
      elementLocale.value = defaultLocale;
      break;
    }
  }
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });
}

export { $t, elementLocale, loadLocaleMessages, setupI18n };
