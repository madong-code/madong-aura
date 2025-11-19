import { AppRouteRecord } from '@/types/router'

export const safeguardRoutes: AppRouteRecord = {
  path: '/example-safeguard',
  name: 'example-safeguard',
  meta: {
    title: 'menus.safeguard.title',
    icon: '&#xe816;',
    keepAlive: false
  },
  children: [
    {
      path: 'server',
      name: 'example-safeguardServer',
      component: '/example/safeguard/server',
      meta: {
        title: 'menus.safeguard.server',
        keepAlive: true
      }
    }
  ]
}
