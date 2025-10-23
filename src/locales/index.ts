import { createI18n } from 'vue-i18n'
import type { I18n, I18nOptions } from 'vue-i18n'
import { merge } from 'lodash-es'
import { LanguageEnum } from '@/enums/appEnum'
import { getSystemStorage } from '@/utils/storage'
import { StorageKeyManager } from '@/utils/storage/storage-key-manager'

const storageKeyManager = new StorageKeyManager()

// 语言映射配置
const langMap: Record<string, { value: LanguageEnum; label: string }> = {
  'zh-CN': { value: LanguageEnum.ZH, label: '简体中文' },
  'en-US': { value: LanguageEnum.EN, label: 'English' },
}

// 定义直接合并到语言根节点的文件名（不带后缀）
const rootFiles = ['en', 'zh'];

// 导入语言模块
const langModules = import.meta.glob('./langs/*/**/*.json', { eager: true })
const effectsLangModules = import.meta.glob('./effects/langs/*/**/*.json', { eager: true })

// 初始化消息对象
const messages: Record<LanguageEnum, Record<string, any>> = {
  [LanguageEnum.ZH]: {},
  [LanguageEnum.EN]: {}
}

/**
 * 将扁平对象转换为嵌套对象
 * @param flatObj - 扁平对象，键使用点分隔表示层级
 * @returns 嵌套对象
 */
function toNestedObject(flatObj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in flatObj) {
    const keys = key.split('.')
    let current = result

    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        current[k] = flatObj[key]
      } else {
        if (!current[k]) current[k] = {}
        current = current[k]
      }
    })
  }

  return result
}

/**
 * 合并语言模块到消息对象
 * @param modules - 语言模块集合
 */
function mergeLangModules(modules: Record<string, any>): void {
  for (const path in modules) {
    // 匹配路径格式: ./langs/<langDir>/<fileName>.json 或 ./effects/langs/<langDir>/<fileName>.json
    const match = path.match(/\.\/(?:effects\/)?langs\/([^\/]+)\/([^\/]+)\.json$/)
    if (!match) continue

    const [, langDir, fileNameWithExt] = match
    const fileName = fileNameWithExt.replace('.json', '')
    const langInfo = langMap[langDir]

    // 跳过无效语言目录
    if (!langInfo) continue

    // 获取模块内容
    const moduleContent = modules[path].default || modules[path]
    const nestedObj = toNestedObject(moduleContent)
    const langValue = langInfo.value

    // 确保语言包对象存在
    if (!messages[langValue]) messages[langValue] = {}

    // 处理不同类型的文件
    if (rootFiles.includes(fileName) || fileNameWithExt === `${langDir}.json`) {
      // 直接合并到语言根节点
      merge(messages[langValue], nestedObj)
    } else {
      // 使用文件名作为命名空间包裹一层
      const wrappedObj = { [fileName]: nestedObj }
      merge(messages[langValue], wrappedObj)
    }
  }
}

// 合并语言模块
mergeLangModules(langModules)
mergeLangModules(effectsLangModules)

// 导出语言选项
export const languageOptions = Object.values(langMap).map(({ value, label }) => ({
  value,
  label
}))

/**
 * 获取默认语言设置
 * @returns 默认语言枚举值
 */
const getDefaultLanguage = (): LanguageEnum => {
  try {
    // 尝试从用户存储获取语言设置
    const storageKey = storageKeyManager.getStorageKey('user')
    const userStore = localStorage.getItem(storageKey)

    if (userStore) {
      const { language } = JSON.parse(userStore)
      if (language && Object.values(LanguageEnum).includes(language)) {
        return language
      }
    }
  } catch (error) {
    console.error('Error reading user language from localStorage:', error)
  }

  try {
    // 尝试从系统存储获取语言设置
    const sys = getSystemStorage()
    if (sys) {
      const { user } = JSON.parse(sys)
      if (user?.language && Object.values(LanguageEnum).includes(user.language)) {
        return user.language
      }
    }
  } catch (error) {
    console.error('Error reading system language:', error)
  }

  // 默认返回中文
  return LanguageEnum.ZH
}

// 配置i18n选项
const i18nOptions: I18nOptions = {
  locale: getDefaultLanguage(),
  legacy: false,
  globalInjection: true,
  fallbackLocale: LanguageEnum.ZH,
  messages
}

// 创建i18n实例
const i18n: I18n = createI18n(i18nOptions)

// 导出全局翻译函数
export const $t = i18n.global.t as (key: string) => string

export default i18n
