import { AppRouteRecord } from '@/types/router'

export const templateRoutes: AppRouteRecord = {
  path: '/example-template',
  name: 'ExampleTemplate',
  meta: {
    title: 'menus.template.title',
    icon: 'ri:apps-2-line'
  },
  children: [
    {
      path: 'example-cards',
      name: 'ExampleCards',
      component: '/example/template/cards',
      meta: {
        title: 'menus.template.cards',
        icon: 'ri:wallet-line',
        keepAlive: false
      }
    },
    {
      path: 'example-banners',
      name: 'ExampleBanners',
      component: '/example/template/banners',
      meta: {
        title: 'menus.template.banners',
        icon: 'ri:rectangle-line',
        keepAlive: false
      }
    },
    {
      path: 'example-charts',
      name: 'ExampleCharts',
      component: '/example/template/charts',
      meta: {
        title: 'menus.template.charts',
        icon: 'ri:bar-chart-box-line',
        keepAlive: false
      }
    },
    {
      path: 'example-map',
      name: 'ExampleMap',
      component: '/example/template/map',
      meta: {
        title: 'menus.template.map',
        icon: 'ri:map-pin-line',
        keepAlive: true
      }
    },
    {
      path: 'example-chat',
      name: 'ExampleChat',
      component: '/example/template/chat',
      meta: {
        title: 'menus.template.chat',
        icon: 'ri:message-3-line',
        keepAlive: true
      }
    },
    {
      path: 'example-calendar',
      name: 'ExampleCalendar',
      component: '/example/template/calendar',
      meta: {
        title: 'menus.template.calendar',
        icon: 'ri:calendar-2-line',
        keepAlive: true
      }
    },
    {
      path: 'example-pricing',
      name: 'ExamplePricing',
      component: '/example/template/pricing',
      meta: {
        title: 'menus.template.pricing',
        icon: 'ri:money-cny-box-line',
        keepAlive: true,
        isFullPage: true
      }
    }
  ]
}
