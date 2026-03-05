import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '@/router/routesAlias'

export default {
  path: '/official',
  name: 'official',
  component: RoutesAlias.Layout,
  meta: {
    title: '微官网',
    icon: 'ri:article-line',
    module: 'demo'
  },
  children: [
    {
      path: 'doc',
      name: 'OfficialDoc',
      component: '/doc/index',
      meta: {
        title: '文档管理',
        icon: 'ri:list-unordered',
        keepAlive: false,
        module: 'official'
      }
    },
    {
      path: 'doc-item',
      name: 'OfficialDocItem',
      component: '/doc-item/index',
      meta: {
        title: '文档章节',
        icon: 'ri:list-unordered',
        keepAlive: false,
        isHide: true,
        module: 'official'
      }
    },
    {
      path: 'market',
      name: 'OfficialMarket',
      component: '/market/index',
      meta: {
        title: '市场管理',
        icon: 'ri:list-unordered',
        keepAlive: false,
        module: 'official'
      }
    },
    {
      path: 'qa',
      name: 'OfficialQa',
      component: '/ask/question/index',
      meta: {
        title: '社区问答',
        icon: 'ri:list-unordered',
        keepAlive: false,
        module: 'official'
      }
    },

  ]
} as AppRouteRecord