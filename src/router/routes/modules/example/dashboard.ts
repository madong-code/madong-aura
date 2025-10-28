import { AppRouteRecord } from '@/types/router'

export const dashboardRoutes: AppRouteRecord = {
  path: '/dashboard',
  name: 'example-dashboard',
  meta: {
    title: 'menus.dashboard.title',
    icon: '&#xe721;',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: '/console',
      name: 'example-console',
      component: '/example/dashboard/console',
      meta: {
        title: 'menus.dashboard.console',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: '/analysis',
      name: 'example-analysis',
      component: '/example/dashboard/analysis',
      meta: {
        title: 'menus.dashboard.analysis',
        keepAlive: false
      }
    },
    {
      path: '/ecommerce',
      name: 'example-ecommerce',
      component: '/example/dashboard/ecommerce',
      meta: {
        title: 'menus.dashboard.ecommerce',
        keepAlive: false
      }
    }
  ]
}
