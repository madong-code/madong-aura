import { AppRouteRecord } from '@/types/router'

export const widgetsRoutes: AppRouteRecord = {
  path: '/widgets',
  name: 'example-widgets',
  meta: {
    title: 'menus.widgets.title',
    icon: '&#xe81a;'
  },
  children: [
    {
      path: 'icon-list',
      name: 'example-iconList',
      component: '/example/widgets/icon-list',
      meta: {
        title: 'menus.widgets.iconList',
        keepAlive: true
      }
    },
    {
      path: 'icon-selector',
      name: 'example-icon-selector',
      component: '/example/widgets/icon-selector',
      meta: {
        title: 'menus.widgets.iconSelector',
        keepAlive: true
      }
    },
    {
      path: 'image-crop',
      name: 'example-image-crop',
      component: '/example/widgets/image-crop',
      meta: {
        title: 'menus.widgets.imageCrop',
        keepAlive: true
      }
    },
    {
      path: 'excel',
      name: 'example-excel',
      component: '/example/widgets/excel',
      meta: {
        title: 'menus.widgets.excel',
        keepAlive: true
      }
    },
    {
      path: 'video',
      name: 'example-video',
      component: '/example/widgets/video',
      meta: {
        title: 'menus.widgets.video',
        keepAlive: true
      }
    },
    {
      path: 'count-to',
      name: 'example-countTo',
      component: '/example/widgets/count-to',
      meta: {
        title: 'menus.widgets.countTo',
        keepAlive: false
      }
    },
    {
      path: 'wang-editor',
      name: 'example-wang-editor',
      component: '/example/widgets/wang-editor',
      meta: {
        title: 'menus.widgets.wangEditor',
        keepAlive: true
      }
    },
    {
      path: 'watermark',
      name: 'example-watermark',
      component: '/example/widgets/watermark',
      meta: {
        title: 'menus.widgets.watermark',
        keepAlive: true
      }
    },
    {
      path: 'context-menu',
      name: 'example-contextMenu',
      component: '/example/widgets/context-menu',
      meta: {
        title: 'menus.widgets.contextMenu',
        keepAlive: true
      }
    },
    {
      path: 'qrcode',
      name: 'example-qrcode',
      component: '/example/widgets/qrcode',
      meta: {
        title: 'menus.widgets.qrcode',
        keepAlive: true
      }
    },
    {
      path: 'drag',
      name: 'example-drag',
      component: '/example/widgets/drag',
      meta: {
        title: 'menus.widgets.drag',
        keepAlive: true
      }
    },
    {
      path: 'text-scroll',
      name: 'example-text-scroll',
      component: '/example/widgets/text-scroll',
      meta: {
        title: 'menus.widgets.textScroll',
        keepAlive: true
      }
    },
    {
      path: 'fireworks',
      name: 'example-fireworks',
      component: '/example/widgets/fireworks',
      meta: {
        title: 'menus.widgets.fireworks',
        keepAlive: true,
        showTextBadge: 'Hot'
      }
    },
    {
      path: '/example/outside/iframe/elementui',
      name: 'example-element-ui',
      component: '',
      meta: {
        title: 'menus.widgets.elementUI',
        keepAlive: false,
        link: 'https://element-plus.org/zh-CN/component/overview.html',
        isIframe: true
      }
    }
  ]
}
