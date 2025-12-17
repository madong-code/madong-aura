import { AppRouteRecord } from '@/types/router'

export const widgetsRoutes: AppRouteRecord = {
  path: '/example-widgets',
  name: 'ExampleWidgets',
  meta: {
    title: 'menus.widgets.title',
    icon: 'ri:apps-2-add-line'
  },
  children: [
    {
      path: 'example-icon',
      name: 'ExampleIcon',
      component: '/example/widgets/icon',
      meta: {
        title: 'menus.widgets.icon',
        icon: 'ri:palette-line',
        keepAlive: true
      }
    },
    {
      path: 'example-image-crop',
      name: 'ExampleImageCrop',
      component: '/example/widgets/image-crop',
      meta: {
        title: 'menus.widgets.imageCrop',
        icon: 'ri:screenshot-line',
        keepAlive: true
      }
    },
    {
      path: 'example-excel',
      name: 'ExampleExcel',
      component: '/example/widgets/excel',
      meta: {
        title: 'menus.widgets.excel',
        icon: 'ri:download-2-line',
        keepAlive: true
      }
    },
    {
      path: 'example-video',
      name: 'ExampleVideo',
      component: '/example/widgets/video',
      meta: {
        title: 'menus.widgets.video',
        icon: 'ri:vidicon-line',
        keepAlive: true
      }
    },
    {
      path: 'example-count-to',
      name: 'ExampleCountTo',
      component: '/example/widgets/count-to',
      meta: {
        title: 'menus.widgets.countTo',
        icon: 'ri:anthropic-line',
        keepAlive: false
      }
    },
    {
      path: 'example-wang-editor',
      name: 'ExampleWangEditor',
      component: '/example/widgets/wang-editor',
      meta: {
        title: 'menus.widgets.wangEditor',
        icon: 'ri:t-box-line',
        keepAlive: true
      }
    },
    {
      path: 'example-watermark',
      name: 'ExampleWatermark',
      component: '/example/widgets/watermark',
      meta: {
        title: 'menus.widgets.watermark',
        icon: 'ri:water-flash-line',
        keepAlive: true
      }
    },
    {
      path: 'example-context-menu',
      name: 'ExampleContextMenu',
      component: '/example/widgets/context-menu',
      meta: {
        title: 'menus.widgets.contextMenu',
        icon: 'ri:menu-2-line',
        keepAlive: true
      }
    },
    {
      path: 'example-qrcode',
      name: 'ExampleQrcode',
      component: '/example/widgets/qrcode',
      meta: {
        title: 'menus.widgets.qrcode',
        icon: 'ri:qr-code-line',
        keepAlive: true
      }
    },
    {
      path: 'example-drag',
      name: 'ExampleDrag',
      component: '/example/widgets/drag',
      meta: {
        title: 'menus.widgets.drag',
        icon: 'ri:drag-move-fill',
        keepAlive: true
      }
    },
    {
      path: 'example-text-scroll',
      name: 'ExampleTextScroll',
      component: '/example/widgets/text-scroll',
      meta: {
        title: 'menus.widgets.textScroll',
        icon: 'ri:input-method-line',
        keepAlive: true
      }
    },
    {
      path: 'example-fireworks',
      name: 'ExampleFireworks',
      component: '/example/widgets/fireworks',
      meta: {
        title: 'menus.widgets.fireworks',
        icon: 'ri:magic-line',
        keepAlive: true,
        showTextBadge: 'Hot'
      }
    },
    {
      path: '/example-outside/iframe/elementui',
      name: 'ExampleElementUI',
      component: '',
      meta: {
        title: 'menus.widgets.elementUI',
        icon: 'ri:apps-2-line',
        keepAlive: false,
        link: 'https://element-plus.org/zh-CN/component/overview.html',
        isIframe: true
      }
    }
  ]
}
