import { AppRouteRecord } from '@/types/router'

export const exceptionRoutes: AppRouteRecord = {
  path: '/example-exception',
  name: 'example-exception',
  meta: {
    title: 'menus.exception.title',
    icon: '&#xe820;'
  },
  children: [
    {
      path: '403',
      name: 'example-exception403',
      component: '/example/exception/403',
      meta: {
        title: 'menus.exception.forbidden',
        keepAlive: true,
        isFullPage: true
      }
    },
    {
      path: '404',
      name: 'example-exception404',
      component: '/example/exception/404',
      meta: {
        title: 'menus.exception.notFound',
        keepAlive: true,
        isFullPage: true
      }
    },
    {
      path: '500',
      name: 'example-exception500',
      component: '/example/exception/500',
      meta: {
        title: 'menus.exception.serverError',
        keepAlive: true,
        isFullPage: true
      }
    }
  ]
}
