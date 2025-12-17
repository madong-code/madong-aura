import { AppRouteRecord } from '@/types/router'

export const examplesRoutes: AppRouteRecord = {
  path: '/example-examples',
  name: 'ExampleExamples',
  meta: {
    title: 'menus.examples.title',
    icon: 'ri:sparkling-line'
  },
  children: [
    {
      path: 'example-permission',
      name: 'ExamplePermission',
      meta: {
        title: 'menus.examples.permission.title',
        icon: 'ri:fingerprint-line'
      },
      children: [
        {
          path: 'example-switch-role',
          name: 'ExamplePermissionSwitchRole',
          component: '/example/examples/permission/switch-role',
          meta: {
            title: 'menus.examples.permission.switchRole',
            icon: 'ri:contacts-line',
            keepAlive: true
          }
        },
        {
          path: 'example-button-auth',
          name: 'ExamplePermissionButtonAuth',
          component: '/example/examples/permission/button-auth',
          meta: {
            title: 'menus.examples.permission.buttonAuth',
            icon: 'ri:mouse-line',
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
          path: 'example-page-visibility',
          name: 'ExamplePermissionPageVisibility',
          component: '/example/examples/permission/page-visibility',
          meta: {
            title: 'menus.examples.permission.pageVisibility',
            icon: 'ri:user-3-line',
            keepAlive: true,
            roles: ['R_SUPER']
          }
        }
      ]
    },
    {
      path: 'example-tabs',
      name: 'ExampleTabs',
      component: '/example/examples/tabs',
      meta: {
        title: 'menus.examples.tabs',
        icon: 'ri:price-tag-line'
      }
    },
    {
      path: 'example-tables/basic',
      name: 'ExampleTablesBasic',
      component: '/example/examples/tables/basic',
      meta: {
        title: 'menus.examples.tablesBasic',
        icon: 'ri:layout-grid-line',
        keepAlive: true
      }
    },
    {
      path: 'example-tables',
      name: 'ExampleTables',
      component: '/example/examples/tables',
      meta: {
        title: 'menus.examples.tables',
        icon: 'ri:table-3',
        keepAlive: true
      }
    },
    {
      path: 'example-forms',
      name: 'ExampleForms',
      component: '/example/examples/forms',
      meta: {
        title: 'menus.examples.forms',
        icon: 'ri:table-view',
        keepAlive: true
      }
    },
    {
      path: 'example-forms/search-bar',
      name: 'ExampleFormsSearchBar',
      component: '/example/examples/forms/search-bar',
      meta: {
        title: 'menus.examples.searchBar',
        icon: 'ri:table-line',
        keepAlive: true
      }
    },
    {
      path: 'example-tables/tree',
      name: 'ExampleTablesTree',
      component: '/example/examples/tables/tree',
      meta: {
        title: 'menus.examples.tablesTree',
        icon: 'ri:layout-2-line',
        keepAlive: true
      }
    },
    {
      path: 'example-socket-chat',
      name: 'ExampleSocketChat',
      component: '/example/examples/socket-chat',
      meta: {
        title: 'menus.examples.socketChat',
        icon: 'ri:shake-hands-line',
        keepAlive: true,
        showTextBadge: 'New'
      }
    }
  ]
}
