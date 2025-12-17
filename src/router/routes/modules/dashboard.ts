import { RoutesAlias } from '@/router/routesAlias'
import { AppRouteRecord } from '@/types/router'

export const routes: AppRouteRecord[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      order: 1,
      title: 'menus.dashboard.title',
      icon: 'ant-design:dashboard-outlined'
      // roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
    },
    children: [
      {
        path: 'workspace',
        name: 'Workspace',
        component: '/dashboard/workspace',
        meta: {
          title: 'menus.dashboard.console',
          keepAlive: false,
          fixedTab: true,
          icon: 'ri:home-smile-2-line'
        }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: '/dashboard/analytics',
        meta: {
          title: 'menus.dashboard.analysis',
          keepAlive: false,
          icon: 'ri:align-item-bottom-line'
        }
      },
      {
        path: 'ecommerce',
        name: 'Ecommerce',
        component: '/dashboard/ecommerce',
        meta: {
          title: 'menus.dashboard.ecommerce',
          keepAlive: false,
          icon: 'ri:bar-chart-box-line'
        }
      }
    ]
  }
]
export default routes
