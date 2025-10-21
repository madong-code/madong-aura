// scripts/clean-dev.ts
import fs from 'fs/promises'
import path from 'path'

// 现代化颜色主题
const theme = {
  // 基础颜色
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // 前景色
  primary: '\x1b[38;5;75m', // 亮蓝色
  success: '\x1b[38;5;82m', // 亮绿色
  warning: '\x1b[38;5;220m', // 亮黄色
  error: '\x1b[38;5;196m', // 亮红色
  info: '\x1b[38;5;159m', // 青色
  purple: '\x1b[38;5;141m', // 紫色
  orange: '\x1b[38;5;208m', // 橙色
  gray: '\x1b[38;5;245m', // 灰色
  white: '\x1b[38;5;255m', // 白色

  // 背景色
  bgDark: '\x1b[48;5;235m', // 深灰背景
  bgBlue: '\x1b[48;5;24m', // 蓝色背景
  bgGreen: '\x1b[48;5;22m', // 绿色背景
  bgRed: '\x1b[48;5;52m' // 红色背景
}

// 现代化图标集
const icons = {
  rocket: '🚀',
  fire: '🔥',
  star: '⭐',
  gem: '💎',
  crown: '👑',
  magic: '✨',
  warning: '⚠️',
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  folder: '📁',
  file: '📄',
  image: '🖼️',
  code: '💻',
  data: '📊',
  globe: '🌐',
  map: '🗺️',
  chat: '💬',
  bolt: '⚡',
  shield: '🛡️',
  key: '🔑',
  link: '🔗',
  clean: '🧹',
  trash: '🗑️',
  check: '✓',
  cross: '✗',
  arrow: '→',
  loading: '⏳'
}

// 格式化工具
const fmt = {
  title: (text: string) => `${theme.bold}${theme.primary}${text}${theme.reset}`,
  subtitle: (text: string) => `${theme.purple}${text}${theme.reset}`,
  success: (text: string) => `${theme.success}${text}${theme.reset}`,
  error: (text: string) => `${theme.error}${text}${theme.reset}`,
  warning: (text: string) => `${theme.warning}${text}${theme.reset}`,
  info: (text: string) => `${theme.info}${text}${theme.reset}`,
  highlight: (text: string) => `${theme.bold}${theme.white}${text}${theme.reset}`,
  dim: (text: string) => `${theme.dim}${theme.gray}${text}${theme.reset}`,
  orange: (text: string) => `${theme.orange}${text}${theme.reset}`,

  // 带背景的文本
  badge: (text: string, bg: string = theme.bgBlue) =>
    `${bg}${theme.white}${theme.bold} ${text} ${theme.reset}`,

  // 渐变效果模拟
  gradient: (text: string) => {
    const colors = ['\x1b[38;5;75m', '\x1b[38;5;81m', '\x1b[38;5;87m', '\x1b[38;5;159m']
    const chars = text.split('')
    return chars.map((char, i) => `${colors[i % colors.length]}${char}`).join('') + theme.reset
  }
}

// 创建现代化标题横幅
function createModernBanner() {
  console.log()
  console.log(
    fmt.gradient('  ╔══════════════════════════════════════════════════════════════════╗')
  )
  console.log(
    fmt.gradient('  ║                                                                  ║')
  )
  console.log(
    `  ║               ${icons.rocket} ${fmt.title('ART DESIGN PRO')} ${fmt.subtitle('· 代码精简程序')} ${icons.magic}                ║`
  )
  console.log(
    `  ║               ${fmt.dim('为项目移除演示数据，快速切换至开发模式')}             ║`
  )
  console.log(
    fmt.gradient('  ║                                                                  ║')
  )
  console.log(
    fmt.gradient('  ╚══════════════════════════════════════════════════════════════════╝')
  )
  console.log()
}

// 创建分割线
function createDivider(char = '─', color = theme.primary) {
  console.log(`${color}${'  ' + char.repeat(66)}${theme.reset}`)
}

// 创建卡片样式容器
function createCard(title: string, content: string[]) {
  console.log(`  ${fmt.badge('', theme.bgBlue)} ${fmt.title(title)}`)
  console.log()
  content.forEach((line) => {
    console.log(`     ${line}`)
  })
  console.log()
}

// 进度条动画
function createProgressBar(current: number, total: number, text: string, width = 40) {
  const percentage = Math.round((current / total) * 100)
  const filled = Math.round((current / total) * width)
  const empty = width - filled

  const filledBar = '█'.repeat(filled)
  const emptyBar = '░'.repeat(empty)

  process.stdout.write(
    `\r  ${fmt.info('进度')} [${theme.success}${filledBar}${theme.gray}${emptyBar}${theme.reset}] ${fmt.highlight(percentage + '%')})}`
  )

  if (current === total) {
    console.log()
  }
}

// 统计信息
const stats = {
  deletedFiles: 0,
  deletedPaths: 0,
  failedPaths: 0,
  startTime: Date.now(),
  totalFiles: 0
}

// 清理目标
const targets = [
  'README.md',
  'README.zh-CN.md',
  'src/views/change',
  'src/views/safeguard',
  'src/views/article',
  'src/views/examples',
  'src/views/system/nested',
  'src/views/widgets',
  'src/views/template',
  'src/views/dashboard/analysis',
  'src/views/dashboard/ecommerce',
  'src/mock/json',
  'src/mock/temp/articleList.ts',
  'src/mock/temp/commentDetail.ts',
  'src/mock/temp/commentList.ts',
  'src/assets/img/cover',
  'src/assets/img/safeguard',
  'src/assets/img/3d',
  'src/components/core/charts/art-map-chart',
  'src/components/custom/comment-widget',
  'src/api/sys',
  'src/api/dictApi.ts',
  'src/api/auth.ts',
  'src/api/system-manage.ts',
  'src/views/sys'
]

// 递归统计文件数量
async function countFiles(targetPath: string): Promise<number> {
  const fullPath = path.resolve(process.cwd(), targetPath)

  try {
    const stat = await fs.stat(fullPath)

    if (stat.isFile()) {
      return 1
    } else if (stat.isDirectory()) {
      const entries = await fs.readdir(fullPath)
      let count = 0

      for (const entry of entries) {
        const entryPath = path.join(targetPath, entry)
        count += await countFiles(entryPath)
      }

      return count
    }
  } catch {
    return 0
  }

  return 0
}

// 统计所有目标的文件数量
async function countAllFiles(): Promise<number> {
  let totalCount = 0

  for (const target of targets) {
    const count = await countFiles(target)
    totalCount += count
  }

  return totalCount
}

// 删除文件和目录
async function remove(targetPath: string, index: number) {
  const fullPath = path.resolve(process.cwd(), targetPath)

  createProgressBar(index + 1, targets.length, targetPath)

  try {
    const fileCount = await countFiles(targetPath)
    await fs.rm(fullPath, { recursive: true, force: true })
    stats.deletedFiles += fileCount
    stats.deletedPaths++
    await new Promise((resolve) => setTimeout(resolve, 50))
  } catch (err) {
    stats.failedPaths++
    console.log()
    console.log(`     ${icons.error} ${fmt.error('删除失败')}: ${fmt.highlight(targetPath)}`)
    console.log(`     ${fmt.dim('错误详情: ' + err)}`)
  }
}

// 清理异步路由
async function cleanAsyncRoutes() {
  const asyncRoutesPath = path.resolve(process.cwd(), 'src/router/routes/asyncRoutes.ts')

  try {
    const cleanedRoutes = `import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 前端静态配置 - 直接使用本文件中定义的路由配置
 * 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 *
 * RoutesAlias.Layout 指向的是布局组件，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 路由元数据（meta）：异步路由在 asyncRoutes 中配置，静态路由在 staticRoutes 中配置
 */
export const asyncRoutes: AppRouteRecord[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.dashboard.title',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'console',
        name: 'Console',
        component: RoutesAlias.Dashboard,
        meta: {
          title: 'menus.dashboard.console',
          keepAlive: false,
          fixedTab: true
        }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.title',
      icon: '&#xe7b9;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: RoutesAlias.User,
        meta: {
          title: 'menus.system.user',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: RoutesAlias.Role,
        meta: {
          title: 'menus.system.role',
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        path: 'user-center',
        name: 'UserCenter',
        component: RoutesAlias.UserCenter,
        meta: {
          title: 'menus.system.userCenter',
          isHide: true,
          keepAlive: true,
          isHideTab: true
        }
      },
      {
        path: 'menu',
        name: 'Menus',
        component: RoutesAlias.Menu,
        meta: {
          title: 'menus.system.menu',
          keepAlive: true,
          roles: ['R_SUPER'],
          authList: [
            {
              title: '新增',
              authMark: 'add'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
          ]
        }
      }
    ]
  },
  {
    path: '/result',
    name: 'Result',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.result.title',
      icon: '&#xe715;'
    },
    children: [
      {
        path: 'success',
        name: 'ResultSuccess',
        component: RoutesAlias.Success,
        meta: {
          title: 'menus.result.success',
          keepAlive: true
        }
      },
      {
        path: 'fail',
        name: 'ResultFail',
        component: RoutesAlias.Fail,
        meta: {
          title: 'menus.result.fail',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/exception',
    name: 'Exception',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.exception.title',
      icon: '&#xe820;'
    },
    children: [
      {
        path: '403',
        name: '403',
        component: RoutesAlias.Exception403,
        meta: {
          title: 'menus.exception.forbidden',
          keepAlive: true,
          isFullPage: true
        }
      },
      {
        path: '404',
        name: '404',
        component: RoutesAlias.Exception404,
        meta: {
          title: 'menus.exception.notFound',
          keepAlive: true,
          isFullPage: true
        }
      },
      {
        path: '500',
        name: '500',
        component: RoutesAlias.Exception500,
        meta: {
          title: 'menus.exception.serverError',
          keepAlive: true,
          isFullPage: true
        }
      }
    ]
  }
]
`

    await fs.writeFile(asyncRoutesPath, cleanedRoutes, 'utf-8')
    console.log(`     ${icons.success} ${fmt.success('重写异步路由配置完成')}`)
  } catch (err) {
    console.log(`     ${icons.error} ${fmt.error('清理异步路由失败')}`)
    console.log(`     ${fmt.dim('错误详情: ' + err)}`)
  }
}

// 清理路由别名
async function cleanRoutesAlias() {
  const routesAliasPath = path.resolve(process.cwd(), 'src/router/routesAlias.ts')

  try {
    const cleanedAlias = `/**
 * 路由别名，方便快速找到页面，同时可以用作路由跳转
 */
export enum RoutesAlias {
  // 布局和认证
  Layout = '/index/index', // 布局容器
  Login = '/auth/login', // 登录
  Register = '/auth/register', // 注册
  ForgetPassword = '/auth/forget-password', // 忘记密码

  // 异常页面
  Exception403 = '/exception/403', // 403
  Exception404 = '/exception/404', // 404
  Exception500 = '/exception/500', // 500

  // 结果页面
  Success = '/result/success', // 成功
  Fail = '/result/fail', // 失败

  // 仪表板
  Dashboard = '/dashboard/console', // 工作台

  // 系统管理
  User = '/system/user', // 账户
  Role = '/system/role', // 角色
  UserCenter = '/system/user-center', // 用户中心
  Menu = '/system/menu' // 菜单
}
`

    await fs.writeFile(routesAliasPath, cleanedAlias, 'utf-8')
    console.log(`     ${icons.success} ${fmt.success('重写路由别名配置完成')}`)
  } catch (err) {
    console.log(`     ${icons.error} ${fmt.error('清理路由别名失败')}`)
    console.log(`     ${fmt.dim('错误详情: ' + err)}`)
  }
}

// 清理变更日志
async function cleanChangeLog() {
  const changeLogPath = path.resolve(process.cwd(), 'src/mock/upgrade/changeLog.ts')

  try {
    const cleanedChangeLog = `import { ref } from 'vue'

interface UpgradeLog {
  version: string // 版本号
  title: string // 更新标题
  date: string // 更新日期
  detail?: string[] // 更新内容
  requireReLogin?: boolean // 是否需要重新登录
  remark?: string // 备注
}

export const upgradeLogList = ref<UpgradeLog[]>([])
`

    await fs.writeFile(changeLogPath, cleanedChangeLog, 'utf-8')
    console.log(`     ${icons.success} ${fmt.success('清空变更日志数据完成')}`)
  } catch (err) {
    console.log(`     ${icons.error} ${fmt.error('清理变更日志失败')}`)
    console.log(`     ${fmt.dim('错误详情: ' + err)}`)
  }
}

// 清理语言文件
async function cleanLanguageFiles() {
  const languageFiles = [
    { path: 'src/locales/langs/zh.json', name: '中文语言文件' },
    { path: 'src/locales/langs/en.json', name: '英文语言文件' }
  ]

  for (const { path: langPath, name } of languageFiles) {
    try {
      const fullPath = path.resolve(process.cwd(), langPath)
      const content = await fs.readFile(fullPath, 'utf-8')
      const langData = JSON.parse(content)

      const menusToRemove = [
        'widgets',
        'template',
        'article',
        'examples',
        'safeguard',
        'plan',
        'help'
      ]

      if (langData.menus) {
        menusToRemove.forEach((menuKey) => {
          if (langData.menus[menuKey]) {
            delete langData.menus[menuKey]
          }
        })

        if (langData.menus.dashboard) {
          if (langData.menus.dashboard.analysis) {
            delete langData.menus.dashboard.analysis
          }
          if (langData.menus.dashboard.ecommerce) {
            delete langData.menus.dashboard.ecommerce
          }
        }

        if (langData.menus.system) {
          const systemKeysToRemove = [
            'nested',
            'menu1',
            'menu2',
            'menu21',
            'menu3',
            'menu31',
            'menu32',
            'menu321'
          ]
          systemKeysToRemove.forEach((key) => {
            if (langData.menus.system[key]) {
              delete langData.menus.system[key]
            }
          })
        }
      }

      await fs.writeFile(fullPath, JSON.stringify(langData, null, 2), 'utf-8')
      console.log(`     ${icons.success} ${fmt.success(`清理${name}完成`)}`)
    } catch (err) {
      console.log(`     ${icons.error} ${fmt.error(`清理${name}失败`)}`)
      console.log(`     ${fmt.dim('错误详情: ' + err)}`)
    }
  }
}

// 清理快速入口组件
async function cleanFastEnterComponent() {
  const fastEnterPath = path.resolve(process.cwd(), 'src/config/fastEnter.ts')

  try {
    const cleanedFastEnter = `/**
 * 快速入口配置
 * 包含：应用列表、快速链接等配置
 */
import { RoutesAlias } from '@/router/routesAlias'
import { WEB_LINKS } from '@/utils/constants'
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  // 显示条件（屏幕宽度）
  minWidth: 1200,
  // 应用列表
  applications: [
    {
      name: '工作台',
      description: '系统概览与数据统计',
      icon: '&#xe721;',
      iconColor: '#377dff',
      path: RoutesAlias.Dashboard,
      enabled: true,
      order: 1
    },
    {
      name: '官方文档',
      description: '使用指南与开发文档',
      icon: '&#xe788;',
      iconColor: '#ffb100',
      path: WEB_LINKS.DOCS,
      enabled: true,
      order: 2
    },
    {
      name: '技术支持',
      description: '技术支持与问题反馈',
      icon: '&#xe86e;',
      iconColor: '#ff6b6b',
      path: WEB_LINKS.COMMUNITY,
      enabled: true,
      order: 3
    },
    {
      name: '哔哩哔哩',
      description: '技术分享与交流',
      icon: '&#xe6b4;',
      iconColor: '#FB7299',
      path: WEB_LINKS.BILIBILI,
      enabled: true,
      order: 4
    }
  ],
  // 快速链接
  quickLinks: [
    {
      name: '登录',
      path: RoutesAlias.Login,
      enabled: true,
      order: 1
    },
    {
      name: '注册',
      path: RoutesAlias.Register,
      enabled: true,
      order: 2
    },
    {
      name: '忘记密码',
      path: RoutesAlias.ForgetPassword,
      enabled: true,
      order: 3
    },
    {
      name: '个人中心',
      path: RoutesAlias.UserCenter,
      enabled: true,
      order: 4
    }
  ]
}

export default Object.freeze(fastEnterConfig)
`

    await fs.writeFile(fastEnterPath, cleanedFastEnter, 'utf-8')
    console.log(`     ${icons.success} ${fmt.success('清理快速入口配置完成')}`)
  } catch (err) {
    console.log(`     ${icons.error} ${fmt.error('清理快速入口配置失败')}`)
    console.log(`     ${fmt.dim('错误详情: ' + err)}`)
  }
}

// 用户确认函数
async function getUserConfirmation(): Promise<boolean> {
  const { createInterface } = await import('readline')

  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log(
      `  ${fmt.highlight('请输入')} ${fmt.success('yes')} ${fmt.highlight('确认执行清理操作，或按 Enter 取消')}`
    )
    console.log()
    process.stdout.write(`  ${icons.arrow} `)

    rl.question('', (answer: string) => {
      rl.close()
      resolve(answer.toLowerCase().trim() === 'yes')
    })
  })
}

// 显示清理警告
async function showCleanupWarning() {
  createCard('安全警告', [
    `${fmt.warning('此操作将永久删除以下演示内容，且无法恢复！')}`,
    `${fmt.dim('请仔细阅读清理列表，确认后再继续操作')}`
  ])

  const cleanupItems = [
    {
      icon: icons.image,
      name: '图片资源',
      desc: '演示用的封面图片、3D图片、运维图片等',
      color: theme.orange
    },
    {
      icon: icons.file,
      name: '演示页面',
      desc: 'widgets、template、article、examples、safeguard等页面',
      color: theme.purple
    },
    {
      icon: icons.code,
      name: '动态路由文件',
      desc: '重写asyncRoutes.ts，只保留核心路由',
      color: theme.primary
    },
    {
      icon: icons.link,
      name: '路由别名',
      desc: '重写routesAlias.ts，移除演示路由别名',
      color: theme.info
    },
    {
      icon: icons.data,
      name: 'Mock数据',
      desc: '演示用的JSON数据、文章列表、评论数据等',
      color: theme.success
    },
    {
      icon: icons.globe,
      name: '多语言文件',
      desc: '清理中英文语言包中的演示菜单项',
      color: theme.warning
    },
    { icon: icons.map, name: '地图组件', desc: '移除art-map-chart地图组件', color: theme.error },
    { icon: icons.chat, name: '评论组件', desc: '移除comment-widget评论组件', color: theme.orange },
    {
      icon: icons.bolt,
      name: '快速入口',
      desc: '移除分析页、礼花效果、聊天、更新日志、定价、留言管理等无效项目',
      color: theme.purple
    }
  ]

  console.log(`  ${fmt.badge('', theme.bgRed)} ${fmt.title('将要清理的内容')}`)
  console.log()

  cleanupItems.forEach((item, index) => {
    console.log(`     ${item.color}${theme.reset} ${fmt.highlight(`${index + 1}. ${item.name}`)}`)
    console.log(`        ${fmt.dim(item.desc)}`)
  })

  console.log()
  console.log(`  ${fmt.badge('', theme.bgGreen)} ${fmt.title('保留的功能模块')}`)
  console.log()

  const preservedModules = [
    { name: 'Dashboard', desc: '工作台页面' },
    { name: 'System', desc: '系统管理模块' },
    { name: 'Result', desc: '结果页面' },
    { name: 'Exception', desc: '异常页面' },
    { name: 'Auth', desc: '登录注册功能' },
    { name: 'Core Components', desc: '核心组件库' }
  ]

  preservedModules.forEach((module) => {
    console.log(`     ${icons.check} ${fmt.success(module.name)} ${fmt.dim(`- ${module.desc}`)}`)
  })

  console.log()
  createDivider()
  console.log()
}

// 显示统计信息
async function showStats() {
  const duration = Date.now() - stats.startTime
  const seconds = (duration / 1000).toFixed(2)

  console.log()
  createCard('清理统计', [
    `${fmt.success('成功删除')}: ${fmt.highlight(stats.deletedFiles.toString())} 个文件`,
    `${fmt.info('涉及路径')}: ${fmt.highlight(stats.deletedPaths.toString())} 个目录/文件`,
    ...(stats.failedPaths > 0
      ? [
        `${icons.error} ${fmt.error('删除失败')}: ${fmt.highlight(stats.failedPaths.toString())} 个路径`
      ]
      : []),
    `${fmt.info('耗时')}: ${fmt.highlight(seconds)} 秒`
  ])
}

// 创建成功横幅
function createSuccessBanner() {
  console.log()
  console.log(
    fmt.gradient('  ╔══════════════════════════════════════════════════════════════════╗')
  )
  console.log(
    fmt.gradient('  ║                                                                  ║')
  )
  console.log(
    `  ║                  ${icons.star} ${fmt.success('清理完成！项目已准备就绪')} ${icons.rocket}                  ║`
  )
  console.log(
    `  ║                    ${fmt.dim('现在可以开始您的开发之旅了！')}                  ║`
  )
  console.log(
    fmt.gradient('  ║                                                                  ║')
  )
  console.log(
    fmt.gradient('  ╚══════════════════════════════════════════════════════════════════╝')
  )
  console.log()
}

// 主函数
async function main() {
  // 清屏并显示横幅
  console.clear()
  createModernBanner()

  // 显示清理警告
  await showCleanupWarning()

  // 统计文件数量
  console.log(`  ${fmt.info('正在统计文件数量...')}`)
  stats.totalFiles = await countAllFiles()

  console.log(`  ${fmt.info('即将清理')}: ${fmt.highlight(stats.totalFiles.toString())} 个文件`)
  console.log(`  ${fmt.dim(`涉及 ${targets.length} 个目录/文件路径`)}`)
  console.log()

  // 用户确认
  const confirmed = await getUserConfirmation()

  if (!confirmed) {
    console.log(`  ${fmt.warning('操作已取消，清理中止')}`)
    console.log()
    return
  }

  console.log()
  console.log(`  ${icons.check} ${fmt.success('确认成功，开始清理...')}`)
  console.log()

  // 开始清理过程
  console.log(`  ${fmt.badge('步骤 1/6', theme.bgBlue)} ${fmt.title('删除演示文件')}`)
  console.log()
  for (let i = 0; i < targets.length; i++) {
    await remove(targets[i], i)
  }
  console.log()

  console.log(`  ${fmt.badge('步骤 2/6', theme.bgBlue)} ${fmt.title('重写路由配置')}`)
  console.log()
  await cleanAsyncRoutes()
  console.log()

  console.log(`  ${fmt.badge('步骤 3/6', theme.bgBlue)} ${fmt.title('重写路由别名')}`)
  console.log()
  await cleanRoutesAlias()
  console.log()

  console.log(`  ${fmt.badge('步骤 4/6', theme.bgBlue)} ${fmt.title('清空变更日志')}`)
  console.log()
  await cleanChangeLog()
  console.log()

  console.log(`  ${fmt.badge('步骤 5/6', theme.bgBlue)} ${fmt.title('清理语言文件')}`)
  console.log()
  await cleanLanguageFiles()
  console.log()

  console.log(`  ${fmt.badge('步骤 6/6', theme.bgBlue)} ${fmt.title('清理快速入口')}`)
  console.log()
  await cleanFastEnterComponent()

  // 显示统计信息
  await showStats()

  // 显示成功横幅
  createSuccessBanner()
}

main().catch((err) => {
  console.log()
  console.log(`  ${icons.error} ${fmt.error('清理脚本执行出错')}`)
  console.log(`  ${fmt.dim('错误详情: ' + err)}`)
  console.log()
  process.exit(1)
})
