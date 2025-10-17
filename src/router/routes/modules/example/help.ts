import { AppRouteRecord } from '@/types/router'
import { WEB_LINKS } from '@/utils/constants'

export const helpRoutes: AppRouteRecord[] = [
  {
    name: 'example-document',
    path: '',
    component: '',
    meta: {
      title: 'menus.help.document',
      icon: '&#xe73e;',
      link: WEB_LINKS.DOCS,
      isIframe: false,
      keepAlive: false
    }
  },
  {
    name: 'example-liteVersion',
    path: '',
    component: '',
    meta: {
      title: 'menus.help.liteVersion',
      icon: '&#xe7ff;',
      link: WEB_LINKS.LiteVersion,
      isIframe: false,
      keepAlive: false
    }
  },
  {
    name: 'example-changeLog',
    path: '/change/log',
    component: '/example/change/log',
    meta: {
      title: 'menus.plan.log',
      showTextBadge: `v${__APP_VERSION__}`,
      icon: '&#xe712;',
      keepAlive: false
    }
  }
]
