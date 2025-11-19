import { AppRouteRecord } from '@/types/router'

export const examplesRoutes: AppRouteRecord = {
  path: '/example-examples',
  name: 'example-examples',
  meta: {
    title: 'menus.examples.title',
    icon: '&#xe8d4;'
  },
  children: [
    {
      path: 'permission',
      name: 'example-permission',
      component: '',
      meta: {
        title: 'menus.examples.permission.title'
      },
      children: [
        {
          path: '/permission/switch-role',
          name: 'example-permissionSwitchRole',
          component: '/example/examples/permission/switch-role',
          meta: {
            title: 'menus.examples.permission.switchRole',
            keepAlive: true
          }
        },
        {
          path: '/permission/button-auth',
          name: 'example-permissionButtonAuth',
          component: '/example/examples/permission/button-auth',
          meta: {
            title: 'menus.examples.permission.buttonAuth',
            keepAlive: true,
            authList: [
              { title: '新增', authMark: 'add' },
              { title: '编辑', authMark: 'edit' },
              { title: '删除', authMark: 'delete' },
              { title: '导出', authMark: 'export' },
              { title: '查看', authMark: 'view' },
              { title: '发布', authMark: 'publish' },
              { title: '配置', authMark: 'config' },
              { title: '管理', authMark: 'manage' }
            ]
          }
        },
        {
          path: '/permission/page-visibility',
          name: 'example-permissionPageVisibility',
          component: '/example/examples/permission/page-visibility',
          meta: {
            title: 'menus.examples.permission.pageVisibility',
            keepAlive: true,
            roles: ['R_SUPER']
          }
        }
      ]
    },
    {
      path: 'tabs',
      name: 'example-tabs',
      component: '/example/examples/tabs',
      meta: {
        title: 'menus.examples.tabs'
      }
    },
    {
      path: 'tables/basic',
      name: 'example-tablesBasic',
      component: '/example/examples/tables/basic',
      meta: {
        title: 'menus.examples.tablesBasic',
        keepAlive: true
      }
    },
    {
      path: 'tables',
      name: 'example-tables',
      component: '/example/examples/tables',
      meta: {
        title: 'menus.examples.tables',
        keepAlive: true
      }
    },
    {
      path: 'forms',
      name: 'example-forms',
      component: '/example/examples/forms',
      meta: {
        title: 'menus.examples.forms',
        keepAlive: true
      }
    },
    {
      path: 'form/search-bar',
      name: 'example-searchBar',
      component: '/example/examples/forms/search-bar',
      meta: {
        title: 'menus.examples.searchBar',
        keepAlive: true
      }
    },
    {
      path: 'tables/tree',
      name: 'example-tablesTree',
      component: '/example/examples/tables/tree',
      meta: {
        title: 'menus.examples.tablesTree',
        keepAlive: true
      }
    }
  ]
}
