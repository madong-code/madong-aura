import { AppRouteRecord } from '@/types/router'

export const resultRoutes: AppRouteRecord = {
  path: '/result',
  name: 'example-result',
  meta: {
    title: 'menus.result.title',
    icon: '&#xe715;'
  },
  children: [
    {
      path: 'success',
      name: 'example-resultSuccess',
      component: '/example/result/success',
      meta: {
        title: 'menus.result.success',
        keepAlive: true
      }
    },
    {
      path: 'fail',
      name: 'example-resultFail',
      component: '/example/result/fail',
      meta: {
        title: 'menus.result.fail',
        keepAlive: true
      }
    }
  ]
}
