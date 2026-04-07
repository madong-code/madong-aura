import { createI18n } from 'vue-i18n'
import type { I18n, I18nOptions } from 'vue-i18n'
import { merge } from 'lodash-es'
import { LanguageEnum } from '@/enums/appEnum'
import { getSystemStorage } from '@/utils/storage'
import { StorageKeyManager } from '@/utils/storage/storage-key-manager'

const storageKeyManager = new StorageKeyManager()

// 语言映射配置 - 只包含两个主要语言，对应前端选择
const langMap: Record<string, {
  value: LanguageEnum;
  label: string;
  dir: string; // 对应的目录名称
}> = {
  'zh-CN': { value: LanguageEnum.ZH, label: '简体中文', dir: 'zh-CN' },
  'en-US': { value: LanguageEnum.EN, label: 'English', dir: 'en-US' },
}

// 目录映射配置 - 用于处理不同大小写的目录名称
const dirMap: Record<string, string> = {
  'zh-cn': 'zh-CN',
  'cn': 'zh-CN',
  'zh': 'zh-CN',
  'en-us': 'en-US',
  'en': 'en-US',
}

// 定义直接合并到语言根节点的文件名（不带后缀）
const rootFiles = ['en', 'zh'];

// 导入语言模块 - 按照优先级顺序，统一使用lang目录
// 1. root 包含 lang 目录 (当前目录 ./lang)
const rootLangModules = import.meta.glob('./lang/**/*.json', { eager: true })
// 2. root 包含 lang 目录 (上层目录 ../lang)
const parentLangModules = import.meta.glob('../lang/**/*.json', { eager: true })
// 3. apps 扫描 (apps 目录下的所有 lang)
const appsLangModules = import.meta.glob('../apps/**/lang/**/*.json', { eager: true })

// 初始化对象
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
 * 标准化语言目录名称
 * @param langDir - 原始语言目录名称
 * @returns 标准化的语言目录名称
 */
function normalizeLangDir(langDir: string): string {
  const lowerDir = langDir.toLowerCase()
  return dirMap[lowerDir] || langDir
}

/**
 * 合并语言模块到消息对象
 * @param modules - 语言模块集合
 * @param priority - 优先级标识，用于控制合并顺序
 * @param moduleType - 模块类型：root|parent|apps
 */
function mergeLangModules(modules: Record<string, any>, priority: number, moduleType: string = 'root'): void {
  let loadedCount = 0

  for (const path in modules) {
    // 匹配不同的路径格式
    let match: RegExpMatchArray | null = null
    let moduleName = ''

    // 当前目录 lang (./lang)
    if (moduleType === 'root') {
      match = path.match(/\.\/lang\/([^\/]+)\/(.*?)\.json$/)
    }
    // 上层目录 lang (../lang)
    else if (moduleType === 'parent') {
      match = path.match(/\.\.\/lang\/([^\/]+)\/(.*?)\.json$/)
      moduleName = 'root'
    }
    // apps 目录 (../apps/**/lang)
    else if (moduleType === 'apps') {
      // 匹配 ../apps/**/lang/语言目录/文件路径.json
      match = path.match(/\.\.\/apps\/([^\/]+)(?:\/.*?)?\/lang\/([^\/]+)\/(.*?)\.json$/)
      if (match) {
        // match[1] 是 app 名称，match[2] 是语言目录，match[3] 是文件路径
        // 我们需要重新组织，让 match[1] 成为 moduleName
        const appMatch = path.match(/\.\.\/apps\/([^\/]+)/)
        if (appMatch) {
          moduleName = appMatch[1]
          // 重新匹配路径，保留语言目录和文件路径
          const langMatch = path.match(/\.\.\/apps\/(?:[^\/]+)(?:\/.*?)?\/lang\/([^\/]+)\/(.*?)\.json$/)
          if (langMatch) {
            match = [path, langMatch[1], langMatch[2]]
          }
        }
      }
    }

    if (!match) {
      console.warn(`[LanguageLoader] 无法识别的语言包路径 (${moduleType}): ${path}`)
      continue
    }

    let langDir: string, restPath: string
    if (moduleType === 'apps') {
      [, langDir, restPath] = match
    } else {
      [, langDir, restPath] = match
    }

    // 标准化语言目录名称
    const normalizedLangDir = normalizeLangDir(langDir)

    // 处理嵌套目录：从restPath中提取文件名，忽略目录部分
    const pathParts = restPath.split('/')
    const fileName = pathParts.pop() || ''
    const fileNameWithoutExt = fileName.replace('.json', '')
    const langInfo = langMap[normalizedLangDir]

    // 跳过无效语言目录
    if (!langInfo) {
      console.warn(`[LanguageLoader] 跳过无效语言目录: ${langDir} (标准化: ${normalizedLangDir})`)
      continue
    }

    // 获取模块内容
    const moduleContent = modules[path].default || modules[path]
    const nestedObj = toNestedObject(moduleContent)
    const langValue = langInfo.value

    // 确保语言包对象存在
    if (!messages[langValue]) messages[langValue] = {}

    // 处理不同类型的文件
    if (rootFiles.includes(fileNameWithoutExt) || fileName === `${langDir}.json` || fileNameWithoutExt === normalizedLangDir) {
      // 直接合并到语言根节点（没有文件命名的key直接语言实现）
      merge(messages[langValue], nestedObj)
      console.log(`[LanguageLoader] 直接合并到语言根节点: ${moduleType} -> ${moduleName || 'root'} -> ${langDir} -> ${fileName}`)
    } else {
      // 处理嵌套目录：同时支持两种访问方式
      const pathParts = restPath.split('/')
      const fileName = pathParts.pop() || ''
      const fileNameWithoutExt = fileName.replace('.json', '')

      // 处理文件名中的点分隔符，将其转换为嵌套结构
      function createNestedObject(namespace: string, value: any): any {
        const parts = namespace.split('.')
        let result: any = {}
        let current = result

        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = {}
          current = current[parts[i]]
        }

        current[parts[parts.length - 1]] = value
        return result
      }

      // 构建包含目录路径的完整命名空间
      let fullNamespace = fileNameWithoutExt
      if (pathParts.length > 0) {
        fullNamespace = pathParts.join('.') + '.' + fileNameWithoutExt
      }

      // 如果是 apps 模块，添加 moduleName 前缀
      if (moduleType === 'apps' && moduleName) {
        fullNamespace = moduleName + '.' + fullNamespace
      }

      // 同时使用两种命名空间，让用户可以选择
      const fullWrappedObj = createNestedObject(fullNamespace, nestedObj)
      const simpleWrappedObj = createNestedObject(fileNameWithoutExt, nestedObj)

      merge(messages[langValue], fullWrappedObj)
      if (moduleType !== 'apps') {
        // 非 apps 模块才添加简单命名空间，避免命名冲突
        merge(messages[langValue], simpleWrappedObj)
      }

      // console.log(`[LanguageLoader] 使用命名空间包裹: ${moduleType} -> ${moduleName || 'root'} -> ${langDir} -> ${restPath}`)
      // console.log(`[LanguageLoader] 支持访问方式: ${fullNamespace}.key${moduleType !== 'apps' ? ` 和 ${fileNameWithoutExt}.key` : ''}`)
    }

    loadedCount++
  }

  console.log(`[LanguageLoader] ${moduleType}目录语言包加载完成，共加载 ${loadedCount} 个文件`)
}

// 按照优先级顺序合并语言模块
// 1. 当前目录 lang (最高优先级) - ./lang
console.log('[LanguageLoader] 开始加载当前目录 lang 语言包...')
mergeLangModules(rootLangModules, 1, 'root')

// 2. 上层目录 lang (高优先级) - ../lang
console.log('[LanguageLoader] 开始加载上层目录 lang 语言包...')
mergeLangModules(parentLangModules, 2, 'parent')

// 3. apps 目录 (中等优先级) - ../apps/**/lang
console.log('[LanguageLoader] 开始加载 apps 语言包...')
mergeLangModules(appsLangModules, 3, 'apps')

// 导出语言选项 - 只包含两个主要语言
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
export const $t = i18n.global.t as any

export default i18n