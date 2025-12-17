import { AppRouteRecord } from '@/types/router'

export const dashboardRoutes: AppRouteRecord = {
  name: 'ExampleDashboard',
  path: '/example-dashboard',
  meta: {
    title: 'menus.dashboard.title',
    icon: 'ri:pie-chart-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'example-console',
      name: 'ExampleConsole',
      component: '/example/dashboard/console',
      meta: {
        title: 'menus.dashboard.console',
        icon: 'ri:home-smile-2-line',
        keepAlive: false,
        fixedTab: false
      }
    },
    {
      path: 'example-analysis',
      name: 'ExampleAnalysis',
      component: '/example/dashboard/analysis',
      meta: {
        title: 'menus.dashboard.analysis',
        icon: 'ri:align-item-bottom-line',
        keepAlive: false
      }
    },
    {
      path: 'example-ecommerce',
      name: 'ExampleEcommerce',
      component: '/example/dashboard/ecommerce',
      meta: {
        title: 'menus.dashboard.ecommerce',
        icon: 'ri:bar-chart-box-line',
        keepAlive: false
      }
    }
  ]
}
