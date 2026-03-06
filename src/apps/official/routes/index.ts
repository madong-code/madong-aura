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
      meta: {
        title: '应用市场',
        icon: 'ant-design:appstore-add-outlined',
        keepAlive: false,
        module: 'official'
      },
      children: [
        {
          path: 'category',
          name: 'OfficialMarketCategory',
          component: '/market/category/index',
          meta: {
            title: '应用分类',
            icon: 'ant-design:exception-outlined',
            keepAlive: false,
            module: 'official'
          }
        },
        {
          path: 'list',
          name: 'OfficialMarketList',
          component: '/market/apps/index',
          meta: {
            title: '应用列表',
            icon: 'ant-design:ordered-list-outlined',
            keepAlive: false,
            module: 'official'
          }
        }

      ]
    },
    {
      path: '/ask',
      name: 'OfficialAsk',
      meta: {
        title: '社区问答',
        icon: 'ant-design:question-circle-outlined',
        keepAlive: false,
        module: 'official'
      },
      children: [
        {
          path: '/ask/question',
          name: 'OfficialQaQuestion',
          component: '/ask/question/index',
          meta: {
            title: '问题列表',
            icon: 'ant-design:ordered-list-outlined',
            keepAlive: false,
            module: 'official'
          }
        },
        {
          path: '/ask/category',
          name: 'OfficialQaCategory',
          component: '/ask/category/index',
          meta: {
            title: '分类管理',
            icon: 'ant-design:exception-outlined',
            keepAlive: false,
            module: 'official'
          }
        },
        {
          path: '/ask/tag',
          name: 'OfficialQaTag',
          component: '/ask/tag/index',
          meta: {
            title: '标签管理',
            icon: 'ant-design:tag-outlined',
            keepAlive: false,
            module: 'official'
          }
        }
      ]
    },

  ]
} as AppRouteRecord