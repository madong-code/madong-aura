import { RoutesAlias } from '../routesAlias'
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
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
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
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: RoutesAlias.Analysis,
        meta: {
          title: 'menus.dashboard.analysis',
          keepAlive: false
        }
      },
      {
        path: 'ecommerce',
        name: 'Ecommerce',
        component: RoutesAlias.Ecommerce,
        meta: {
          title: 'menus.dashboard.ecommerce',
          keepAlive: false
        }
      }
    ]
  },
  {
    path: '/sys/manager',
    name: 'sys:manager',
    component: RoutesAlias.Layout,
    meta: {
      title: '系统设置',
      icon: '&#xe7ae;'
    },
    children: [
      {
        path: '/sys/user/index',
        name: 'sys:user',
        component: '/sys/user/index',
        meta: {
          title: '用户管理',
          keepAlive: true,
          authList: [
            {
              title: '分页查询用户列表',
              authMark: 'sys:user:page'
            },
            {
              title: '新增用户',
              authMark: 'sys:user:save'
            },
            {
              title: '编辑用户',
              authMark: 'sys:user:update'
            },
            {
              title: '删除用户',
              authMark: 'sys:user:remove'
            }
          ]
        }
      }
    ]
  }
]
