import { AppRouteRecord } from '@/types/router'

export const articleRoutes: AppRouteRecord = {
  path: '/example-article',
  name: 'example-article',
  meta: {
    title: 'menus.article.title',
    icon: '&#xe7ae;',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'article-list',
      name: 'example-articleList',
      component: '/example/article/list',
      meta: {
        title: 'menus.article.articleList',
        keepAlive: true,
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' }
        ]
      }
    },
    {
      path: 'detail/:id',
      name: 'example-articleDetail',
      component: '/example/article/detail',
      meta: {
        title: 'menus.article.articleDetail',
        isHide: true,
        keepAlive: true,
        activePath: '/example/article/article-list'
      }
    },
    {
      path: 'comment',
      name: 'example-articleComment',
      component: '/example/article/comment',
      meta: {
        title: 'menus.article.comment',
        keepAlive: true
      }
    },
    {
      path: 'publish',
      name: 'example-articlePublish',
      component: '/example/article/publish',
      meta: {
        title: 'menus.article.articlePublish',
        keepAlive: true,
        authList: [{ title: '发布', authMark: 'add' }]
      }
    }
  ]
}
