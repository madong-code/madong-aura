import type { SupportedLanguagesType } from '#/core/locales';

type LocaleMessages = Record<string, any>;

let conflictWarnCount = 0;

const LOCALE_DIR_MAP: Record<string, string> = {
  en: 'en-US',
  'en-GB': 'en-US',
  'en-US': 'en-US',
  en_US: 'en-US',
  zh: 'zh-CN',
  'zh-CN': 'zh-CN',
  zh_CN: 'zh-CN',
  'zh-Hans': 'zh-CN',
};

function normalizeLocaleDir(lang: SupportedLanguagesType): string {
  return LOCALE_DIR_MAP[lang] || lang;
}

function deepMerge(
  target: LocaleMessages,
  source: LocaleMessages,
): LocaleMessages {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function setNestedValue(
  obj: LocaleMessages,
  keys: string[],
  value: LocaleMessages,
): void {
  if (keys.length === 0) return;

  let current: LocaleMessages = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string;
    if (!current[key]) current[key] = {};
    current = current[key] as LocaleMessages;
  }
  const lastKey = keys[keys.length - 1] as string;
  const existing = current[lastKey];
  if (
    existing &&
    typeof existing === 'object' &&
    !Array.isArray(existing) &&
    typeof value === 'object'
  ) {
    deepMerge(existing as LocaleMessages, value);
  } else if (existing !== undefined && conflictWarnCount < 10) {
    conflictWarnCount++;
    const keyPath = keys.join('.');
    console.warn(
      `[i18n] Key conflict detected: "${keyPath}" is being overwritten. ` +
        `This may be caused by both directory-based file and dotted-filename file producing the same key.`,
    );
    current[lastKey] = value;
  } else {
    current[lastKey] = value;
  }
}

// ============ 模式1: 目录+文件+key (用于 lang/) ============
function extractDirFileKeys(
  path: string,
  baseDir: string,
): null | { fileKeys: string[]; localeDir: string } {
  const parts = path.split('/');
  const baseIndex = parts.lastIndexOf(baseDir);
  if (baseIndex === -1 || baseIndex + 2 >= parts.length) return null;

  const localeDir = parts[baseIndex + 1];
  if (!localeDir) return null;

  const dirParts = parts.slice(baseIndex + 2, -1); // 中间目录 = key 前缀
  const fileName = parts.at(-1)?.replace('.json', '') || '';
  const fileNameParts = fileName.split('.').filter(Boolean); // 文件名中的点也参与 key 层级

  return { localeDir, fileKeys: [...dirParts, ...fileNameParts] };
}

// ============ 模式2: 插件命名空间 + 目录+文件+key (用于 plugin/*/lang/) ============
function extractPluginFileKeys(
  path: string,
): null | { fileKeys: string[]; localeDir: string } {
  const parts = path.split('/');
  const pluginIndex = parts.indexOf('plugin');
  const langIndex = parts.indexOf('lang');
  if (pluginIndex === -1 || langIndex === -1 || langIndex + 2 >= parts.length)
    return null;

  const pluginKey = parts[pluginIndex + 1]; // 插件名 = key 前缀
  const localeDir = parts[langIndex + 1];
  if (!pluginKey || !localeDir) return null;

  const dirParts = parts.slice(langIndex + 2, -1); // lang/ 之后、文件名之前的目录
  const fileName = parts.at(-1)?.replace('.json', '') || '';
  const fileNameParts = fileName.split('.').filter(Boolean); // 文件名中的点也参与 key 层级

  return { localeDir, fileKeys: [pluginKey, ...dirParts, ...fileNameParts] };
}

// ============ 模式3: root 模式 + 目录+文件+key (用于 locales/langs/) ============
function extractRootFileKeys(
  path: string,
  baseDir: string,
): null | { fileKeys: string[]; localeDir: string } {
  const parts = path.split('/');
  const baseIndex = parts.lastIndexOf(baseDir);
  if (baseIndex === -1 || baseIndex + 2 >= parts.length) return null;

  const localeDir = parts[baseIndex + 1];
  if (!localeDir) return null;

  const afterBase = parts.slice(baseIndex + 2); // baseDir + localeDir 之后的部分
  const fileName = parts.at(-1)?.replace('.json', '') || '';
  const fileNameParts = fileName.split('.').filter(Boolean); // 文件名中的点也参与 key 层级

  if (afterBase.length === 1) {
    // 根目录下文件 → root 模式：文件名点号分割后全部为 key
    return { localeDir, fileKeys: fileNameParts };
  }

  // 子目录下文件 → 目录+文件+key 模式
  const dirParts = afterBase.slice(0, -1);
  return { localeDir, fileKeys: [...dirParts, ...fileNameParts] };
}

function loadAppLangLocales(localeDir: string): LocaleMessages {
  const messages: LocaleMessages = {};

  const langModules = import.meta.glob<{ default: LocaleMessages }>(
    '../../lang/**/*.json',
    { eager: true },
  );

  for (const [path, module] of Object.entries(langModules)) {
    const result = extractDirFileKeys(path, 'lang');
    if (!result || result.localeDir !== localeDir) continue;

    setNestedValue(messages, result.fileKeys, module.default);
  }

  return messages;
}

function loadLocalesLangs(localeDir: string): LocaleMessages {
  const messages: LocaleMessages = {};

  const localesModules = import.meta.glob<{ default: LocaleMessages }>(
    '../langs/**/*.json',
    { eager: true },
  );

  for (const [path, module] of Object.entries(localesModules)) {
    const result = extractRootFileKeys(path, 'langs');
    if (!result || result.localeDir !== localeDir) continue;

    setNestedValue(messages, result.fileKeys, module.default);
  }

  return messages;
}

function loadPluginLocales(localeDir: string): LocaleMessages {
  const messages: LocaleMessages = {};

  const pluginModules = import.meta.glob<{ default: LocaleMessages }>(
    '../../plugin/**/lang/**/*.json',
    { eager: true },
  );

  for (const [path, module] of Object.entries(pluginModules)) {
    const result = extractPluginFileKeys(path);
    if (!result || result.localeDir !== localeDir) continue;

    setNestedValue(messages, result.fileKeys, module.default);
  }

  return messages;
}

export function loadAllLocaleMessages(
  lang: SupportedLanguagesType,
): LocaleMessages {
  const localeDir = normalizeLocaleDir(lang);
  const messages: LocaleMessages = {};

  deepMerge(messages, loadLocalesLangs(localeDir));
  deepMerge(messages, loadAppLangLocales(localeDir));
  deepMerge(messages, loadPluginLocales(localeDir));

  return messages;
}
