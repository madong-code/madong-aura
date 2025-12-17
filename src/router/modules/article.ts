import { AppRouteRecord } from '@/types/router'

export const articleRoutes: AppRouteRecord = {
  path: '/example-article',
  name: 'ExampleArticle',
  meta: {
    title: 'menus.article.title',
    icon: 'ri:book-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'example-article-list',
      name: 'ExampleArticleList',
      component: '/example/article/list',
      meta: {
        title: 'menus.article.articleList',
        icon: 'ri:article-line',
        keepAlive: true,
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' }
        ]
      }
    },
    {
      path: 'example-detail/:id',
      name: 'ExampleArticleDetail',
      component: '/example/article/detail',
      meta: {
        title: 'menus.article.articleDetail',
        isHide: true,
        keepAlive: true,
        activePath: '/article/article-list'
      }
    },
    {
      path: 'example-comment',
      name: 'ExampleArticleComment',
      component: '/example/article/comment',
      meta: {
        title: 'menus.article.comment',
        icon: 'ri:mail-line',
        keepAlive: true
      }
    },
    {
      path: 'example-publish',
      name: 'ExampleArticlePublish',
      component: '/example/article/publish',
      meta: {
        title: 'menus.article.articlePublish',
        icon: 'ri:telegram-2-line',
        keepAlive: true,
        authList: [{ title: '发布', authMark: 'add' }]
      }
    }
  ]
}
