import { AppRouteRecord } from '@/types'
import { AppRouteRecordRaw } from '@/utils/router'
import { AppsRouteManager } from '../core/AppsRouteManager'

// 创建功能模块路由管理器实例
const appsRouteManager = new AppsRouteManager()

/**
 * 静态路由配置（不需要权限就能访问的路由）
 *
 * 属性说明：
 * isHideTab: true 表示不在标签页中显示
 *
 * 注意事项：
 * 1、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 * 2、静态路由不管是否登录都可以访问
 */
export const staticRoutes: AppRouteRecordRaw[] = [
  // 不需要登录就能访问的路由示例
  // {
  //   path: '/welcome',
  //   name: 'WelcomeStatic',
  //   component: () => import('@views/dashboard/console/index.vue'),
  //   meta: { title: 'menus.dashboard.title' }
  // },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/login/index.vue'),
    meta: { title: 'menus.login.title', isHideTab: true }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/views/auth/register/index.vue'),
    meta: { title: 'menus.register.title', isHideTab: true }
  },
  {
    path: '/auth/forget-password',
    name: 'ForgetPassword',
    component: () => import('@/views/auth/forget-password/index.vue'),
    meta: { title: 'menus.forgetPassword.title', isHideTab: true }
  },
  {
    path: '/403',
    name: 'Exception403',
    component: () => import('@/views/exception/403/index.vue'),
    meta: { title: '403', isHideTab: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Exception404',
    component: () => import('@/views/exception/404/index.vue'),
    meta: { title: '404', isHideTab: true }
  },
  {
    path: '/500',
    name: 'Exception500',
    component: () => import('@/views/exception/500/index.vue'),
    meta: { title: '500', isHideTab: true }
  },
  {
    path: '/outside',
    component: () => import('@/layout/index.vue'),
    name: 'Outside',
    meta: { title: 'menus.outside.title' },
    children: [
      // iframe 内嵌页面
      {
        path: '/outside/iframe/:path',
        name: 'Iframe',
        component: () => import('@/layout/outside/index.vue'),
        meta: { title: 'iframe' }
      }
    ]
  },
]





/**
 *
 * 后端路由模式-静态路由配置（不需要权限就能访问的路由并显示左侧菜单）
 *
 * 属性说明：
 * isHideTab: true 表示不在标签页中显示
 *
 * 注意事项：
 * 1、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 * 2、静态路由不管是否登录都可以访问
 */
export const localRoutes: AppRouteRecord[] = [
  {
    path: "/system/user-center",
    name: "system:user-center",
    component: "/system/user-center/index",
    meta: {
      module: "app", // 添加模块信息，指定从 app 模块加载
      isHide: true,//不显示在菜单列表
      title: "个人中心",
      keepAlive: false,
    },
  },
  {
    path: '/generator/code/:id?',
    name: 'CodeGenerator',
    component: '/tools/apps/generator/generator',
    meta: {
      module: "app", // 添加模块信息，指定从 app 模块加载
      title: '代码生成器',
      isHide: true,
    },
  },
  // 自动扫描的功能模块-静态路由
  ...appsRouteManager.getAppsRoutes()
]



