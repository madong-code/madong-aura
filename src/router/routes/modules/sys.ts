import { RoutesAlias } from '@/router/routesAlias'
import { AppRouteRecord } from '@/types/router'

export const routes: AppRouteRecord[] = [
  {
    path: '/sys/manager',
    name: 'sys:manager',
    component: RoutesAlias.Layout,
    meta: {
      order: 10,
      title: '系统设置',
      icon: '&#xe7ae;'
    },
    children: [
      {
        path: '/examples/form/index',
        name: 'sys:role',
        component: '/examples/form/index',
        meta: {
          title: '表单示例'
        }
      },
      {
        path: '/sys/user/index',
        name: 'sys:user',
        component: '/sys/user/index',
        meta: {
          title: '用户管理',
          keepAlive: true,
          authList: [
            {
              title: '分页查询用户列表',
              authMark: 'sys:user:page'
            },
            {
              title: '新增用户',
              authMark: 'sys:user:save'
            },
            {
              title: '编辑用户',
              authMark: 'sys:user:update'
            },
            {
              title: '删除用户',
              authMark: 'sys:user:remove'
            }
          ]
        }
      }
    ]
  }
]
export default routes
