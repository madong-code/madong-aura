import { AppRouteRecord } from '@/types/router'

export const resultRoutes: AppRouteRecord = {
  path: '/example-result',
  name: 'ExampleResult',
  meta: {
    title: 'menus.result.title',
    icon: 'ri:checkbox-circle-line'
  },
  children: [
    {
      path: 'example-success',
      name: 'ExampleResultSuccess',
      component: '/example/result/success',
      meta: {
        title: 'menus.result.success',
        icon: 'ri:checkbox-circle-line',
        keepAlive: true
      }
    },
    {
      path: 'example-fail',
      name: 'ExampleResultFail',
      component: '/example/result/fail',
      meta: {
        title: 'menus.result.fail',
        icon: 'ri:close-circle-line',
        keepAlive: true
      }
    }
  ]
}
