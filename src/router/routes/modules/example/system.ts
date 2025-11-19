import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/example-system',
  name: 'example-system',
  meta: {
    title: 'menus.system.title',
    icon: '&#xe7b9;',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'example-user',
      component: '/example/system/user',
      meta: {
        title: 'menus.system.user',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'role',
      name: 'example-role',
      component: '/example/system/role',
      meta: {
        title: 'menus.system.role',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'user-center',
      name: 'example-userCenter',
      component: '/example/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    },
    {
      path: 'menu',
      name: 'example-menus',
      component: '/example/system/menu',
      meta: {
        title: 'menus.system.menu',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'nested',
      name: 'example-nested',
      component: '',
      meta: {
        title: 'menus.system.nested',
        keepAlive: true
      },
      children: [
        {
          path: 'menu1',
          name: 'example-nested-menu1',
          component: '/example/system/nested/menu1',
          meta: {
            title: 'menus.system.menu1',
            icon: '&#xe676;',
            keepAlive: true
          }
        },
        {
          path: 'menu2',
          name: 'example-nested-menu2',
          component: '',
          meta: {
            title: 'menus.system.menu2',
            icon: '&#xe676;',
            keepAlive: true
          },
          children: [
            {
              path: 'menu2-1',
              name: 'example-nested-menu2-1',
              component: '/example/system/nested/menu2',
              meta: {
                title: 'menus.system.menu21',
                icon: '&#xe676;',
                keepAlive: true
              }
            }
          ]
        },
        {
          path: 'menu3',
          name: 'example-nested-menu3',
          component: '',
          meta: {
            title: 'menus.system.menu3',
            icon: '&#xe676;',
            keepAlive: true
          },
          children: [
            {
              path: 'menu3-1',
              name: 'example-nested-menu3-1',
              component: '/example/system/nested/menu3',
              meta: {
                title: 'menus.system.menu31',
                icon: '&#xe676;',
                keepAlive: true
              }
            },
            {
              path: 'menu3-2',
              name: 'example-nested-menu3-2',
              component: '',
              meta: {
                title: 'menus.system.menu32',
                icon: '&#xe676;',
                keepAlive: true
              },
              children: [
                {
                  path: 'menu3-2-1',
                  name: 'example-nested-menu3-2-1',
                  component: '/example/system/nested/menu3/menu3-2',
                  meta: {
                    title: 'menus.system.menu321',
                    icon: '&#xe676;',
                    keepAlive: true
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
