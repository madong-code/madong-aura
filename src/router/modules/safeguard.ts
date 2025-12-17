import { AppRouteRecord } from '@/types/router'

export const safeguardRoutes: AppRouteRecord = {
  path: '/example-safeguard',
  name: 'ExampleSafeguard',
  meta: {
    title: 'menus.safeguard.title',
    icon: 'ri:shield-check-line',
    keepAlive: false
  },
  children: [
    {
      path: 'example-server',
      name: 'ExampleSafeguardServer',
      component: '/example/safeguard/server',
      meta: {
        title: 'menus.safeguard.server',
        icon: 'ri:hard-drive-3-line',
        keepAlive: true
      }
    }
  ]
}
