import { AppRouteRecordRaw } from '#/core/shared/art-utils/router'

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

// 【art-admin 修复】个人中心隐藏路由静态注册。
// 用户菜单"个人中心"跳转 /_core/profile，页面用 template/admin 原版一致的
// views/_core/profile（Page + 用户卡片 + 基础设置 + 安全设置 + 我的在线设备）。
// 该项目为后端控制模式（MenuProcessor.processBackendMenu），路由由后端
// /system/auth/user-menus 下发；后端不返回 isHide 隐藏路由，导致个人中心
// 未被注册 → 404。这里将隐藏路由静态注册，确保个人中心始终可访问。
const profileRoute: AppRouteRecordRaw = {
  path: '/_core/profile',
  name: 'Profile',
  component: () => import('#/core/ui/layout/AppLayout.vue'),
  meta: { title: 'menus.system.userCenter', isHide: true },
  children: [
    {
      path: '',
      name: 'ProfilePage',
      component: () => import('#/views/_core/profile/index.vue'),
      meta: { title: 'menus.system.userCenter', isHideTab: true },
    },
  ],
};
export const staticRoutes: AppRouteRecordRaw[] = [
  // 个人中心隐藏路由（用户菜单"个人中心"跳转目标，见上方 profileRoute）
  profileRoute,
  // 【art-admin 404 兜底】404 父路由放在数组最前，避开通配干扰。
  // 【关键】404 子路由的 name 不能是 `Exception404`——RouteRegistry.register
  // 的 CATCH_ALL_NAMES = ['Exception404'] 会把该 name 的路由当 catch-all 移除
  // 并作为顶层路由重新添加，导致子路由脱离父 AppLayout（匹配时只有父、布局空白）。
  // 因此这里子路由 name 用 `NotFoundPage`（避开 catch-all 处理），保持父子嵌套，
  // 404 在布局右侧内容区显示。守卫 beforeEach.ts 未匹配时 next({ path: '/400' })。
  {
    path: '/400',
    component: () => import('#/core/ui/layout/AppLayout.vue'),
    name: 'Exception404Wrap',
    meta: { title: '404', isHide: true },
    children: [
      {
        path: '',
        name: 'NotFoundPage',
        component: () => import('#/views/_core/fallback/not-found.vue'),
        meta: { title: '404', isHideTab: true },
      },
    ],
  },
  // 不需要登录就能访问的路由示例
  // {
  //   path: '/welcome',
  //   name: 'WelcomeStatic',
  //   component: () => import('#/views/dashboard/console/index.vue'),
  //   meta: { title: 'menus.dashboard.title' }
  // },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('#/views/_core/authentication/login.vue'),
    meta: { title: 'menus.login.title', isHideTab: true }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('#/views/_core/authentication/register.vue'),
    meta: { title: 'menus.register.title', isHideTab: true }
  },
  {
    path: '/auth/forget-password',
    name: 'ForgetPassword',
    component: () => import('#/views/_core/authentication/forget-password.vue'),
    meta: { title: 'menus.forgetPassword.title', isHideTab: true }
  },
  // 【art-admin 调整】异常页（403/404/500/401）套 AppLayout 壳，
  // 让异常页在布局右侧内容区显示（带左侧菜单、顶部栏），而非独立全屏页面。
  // 注意：404 父路由必须用精确路径 /404（与 403/500/401 一致），
  // 通配 `/:pathMatch(.*)*` 用 redirect 跳转到 /404 path（path 跳转会渲染完整路由树）。
  {
    path: '/403',
    component: () => import('#/core/ui/layout/AppLayout.vue'),
    name: 'Exception403Wrap',
    meta: { title: '403', isHide: true },
    children: [
      {
        path: '',
        name: 'Exception403',
        component: () => import('#/views/_core/fallback/forbidden.vue'),
        meta: { title: '403', isHideTab: true },
      },
    ],
  },
  {
    path: '/500',
    component: () => import('#/core/ui/layout/AppLayout.vue'),
    name: 'Exception500Wrap',
    meta: { title: '500', isHide: true },
    children: [
      {
        path: '',
        name: 'Exception500',
        component: () => import('#/views/_core/fallback/internal-error.vue'),
        meta: { title: '500', isHideTab: true },
      },
    ],
  },
  {
    path: '/401',
    component: () => import('#/core/ui/layout/AppLayout.vue'),
    name: 'Exception401Wrap',
    meta: { title: '401', isHide: true },
    children: [
      {
        path: '',
        name: 'Exception401',
        component: () => import('#/views/_core/fallback/unauthorized.vue'),
        meta: { title: '401', isHideTab: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'NotFoundPage' }
  },
  {
    path: '/outside',
    component: () => import('#/core/ui/layout/AppLayout.vue'),
    name: 'Outside',
    meta: { title: 'menus.outside.title' },
    children: [
      // iframe 内嵌页面
      {
        path: '/outside/iframe/:path',
        name: 'Iframe',
        component: () => import('#/views/_core/iframe.vue'),
        meta: { title: 'iframe' }
      }
    ]
  }
]
