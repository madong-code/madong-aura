import { AppRouteRecord } from '@/types/router'

export const exceptionRoutes: AppRouteRecord = {
  path: '/example-exception',
  name: 'ExampleException',
  meta: {
    title: 'menus.exception.title',
    icon: 'ri:error-warning-line'
  },
  children: [
    {
      path: 'example-403',
      name: 'ExampleException403',
      component: '/example/exception/403',
      meta: {
        title: 'menus.exception.forbidden',
        keepAlive: true,
        isHideTab: true,
        isFullPage: true
      }
    },
    {
      path: 'example-404',
      name: 'ExampleException404',
      component: '/example/exception/404',
      meta: {
        title: 'menus.exception.notFound',
        keepAlive: true,
        isHideTab: true,
        isFullPage: true
      }
    },
    {
      path: 'example-500',
      name: 'ExampleException500',
      component: '/example/exception/500',
      meta: {
        title: 'menus.exception.serverError',
        keepAlive: true,
        isHideTab: true,
        isFullPage: true
      }
    }
  ]
}
