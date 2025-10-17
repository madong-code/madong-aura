import { AppRouteRecord } from '@/types/router'

export const templateRoutes: AppRouteRecord = {
  path: '/template',
  name: 'example-template',
  meta: {
    title: 'menus.template.title',
    icon: '&#xe860;'
  },
  children: [
    {
      path: 'cards',
      name: 'example-cards',
      component: '/example/template/cards',
      meta: {
        title: 'menus.template.cards',
        keepAlive: false
      }
    },
    {
      path: 'banners',
      name: 'example-banners',
      component: '/example/template/banners',
      meta: {
        title: 'menus.template.banners',
        keepAlive: false
      }
    },
    {
      path: 'charts',
      name: 'example-charts',
      component: '/example/template/charts',
      meta: {
        title: 'menus.template.charts',
        keepAlive: false
      }
    },
    {
      path: 'map',
      name: 'example-map',
      component: '/example/template/map',
      meta: {
        title: 'menus.template.map',
        keepAlive: true
      }
    },
    {
      path: 'chat',
      name: 'example-chat',
      component: '/example/template/chat',
      meta: {
        title: 'menus.template.chat',
        keepAlive: true
      }
    },
    {
      path: 'calendar',
      name: 'example-calendar',
      component: '/example/template/calendar',
      meta: {
        title: 'menus.template.calendar',
        keepAlive: true
      }
    },
    {
      path: 'pricing',
      name: 'example-pricing',
      component: '/example/template/pricing',
      meta: {
        title: 'menus.template.pricing',
        keepAlive: true,
        isFullPage: true
      }
    }
  ]
}
