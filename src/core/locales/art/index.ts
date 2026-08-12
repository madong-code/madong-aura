/**
 * 国际化桥接层（art-admin）
 *
 * 说明：
 * art-design-pro 原生使用独立的 vue-i18n 实例（locale = 'zh' | 'en'），
 * 而从 admin 迁移过来的业务层使用 `#/core/locales` 的 i18n 实例
 * （locale = 'zh-CN' | 'en-US'）。
 *
 * 一个应用只能有一个 vue-i18n 实例，否则 `useI18n()` 会取到不同的上下文，
 * 导致 art 布局壳与 admin 业务页的翻译互相看不到。
 *
 * 因此这里统一为：**以 `#/core/locales` 的实例为唯一实例**，
 * 把 art 自带的 zh.json / en.json 合并进 `zh-CN` / `en-US` 命名空间，
 * 并保持 art 原有的导出签名（default i18n、$t、languageOptions）不变，
 * 这样 art 现有代码无需改动。
 *
 * @module art/locales
 */

import type { SupportedLanguagesType } from '#/core/locales'

import { i18n, $t as coreT } from '#/core/locales'
import { loadLocaleMessages } from '#/locales'
import { updatePreferences } from '#/core/preferences'
import { LanguageEnum } from '#/core/enums/appEnum'

// 同步导入 art 语言文件
import enMessages from './langs/en.json'
import zhMessages from './langs/zh.json'

/**
 * art 语言码 -> 核心 i18n 语言码
 */
export const ART_LOCALE_MAP: Record<string, string> = {
  [LanguageEnum.ZH]: 'zh-CN',
  [LanguageEnum.EN]: 'en-US'
}

/**
 * 核心 i18n 语言码 -> art 语言码
 */
export const CORE_LOCALE_MAP: Record<string, LanguageEnum> = {
  'zh-CN': LanguageEnum.ZH,
  'en-US': LanguageEnum.EN
}

/**
 * 把 art 的语言包合并进核心 i18n 实例。
 *
 * 必须在 `setupI18n()` / `loadLocaleMessages()` **之后** 调用：
 * 核心的 `loadLocaleMessages` 内部用的是 `setLocaleMessage`（整体覆盖），
 * 先合并会被冲掉，所以每次切换语言后都要重新合并一次。
 *
 * 使用 mergeLocaleMessage 保证不会覆盖 admin 已有的 key。
 */
export function mergeArtMessages(): void {
  i18n.global.mergeLocaleMessage('zh-CN', zhMessages as Record<string, unknown>)
  i18n.global.mergeLocaleMessage('en-US', enMessages as Record<string, unknown>)
}

/**
 * 语言选项列表，用于语言切换下拉框
 */
export const languageOptions = [
  { value: LanguageEnum.ZH, label: '简体中文' },
  { value: LanguageEnum.EN, label: 'English' }
]

/**
 * 全局翻译函数（复用核心实例）
 */
export const $t = coreT as (key: string) => string

/**
 * 当前 art 语言码（由核心 i18n 的 locale 反查）
 */
export function getArtLocale(): LanguageEnum {
  const current = String((i18n.global.locale as { value: string }).value)
  return CORE_LOCALE_MAP[current] ?? LanguageEnum.ZH
}

/**
 * 切换语言（art 壳统一入口）
 *
 * 与直接 `locale.value = 'zh'` 的区别：
 * 1. 会把 art 语言码转换为核心语言码；
 * 2. 会触发 admin 侧的语言包按需加载（含 element-plus / dayjs / vxe-table）；
 * 3. 会同步写入 preferences，保证刷新后保持。
 *
 * @param lang art 语言枚举值
 */
export async function changeAppLanguage(lang: LanguageEnum): Promise<void> {
  const target = (ART_LOCALE_MAP[lang] ?? 'zh-CN') as SupportedLanguagesType
  if (String((i18n.global.locale as { value: string }).value) === target) return

  await loadLocaleMessages(target)
  // 重新合并 art 语言包（loadLocaleMessages 只会加载 admin 的包）
  mergeArtMessages()
  updatePreferences({ app: { locale: target } })
}

/**
 * 导出核心 i18n 实例，保持与 art 原有 `import i18n from '#/core/locales/art'` 兼容。
 *
 * 注意：`i18n.global.locale` 的值是 `zh-CN` / `en-US`，
 * art 侧如需按 `zh` / `en` 判断，请用 `CORE_LOCALE_MAP` 转换。
 */
export default i18n
