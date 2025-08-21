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
      icon: 'ant-design:setting-outlined'
    },
    children: [
      {
        path: '/examples/form/index',
        name: 'examples:form',
        component: '/examples/form/index',
        meta: {
          title: '表单示例',
          icon: 'ant-design:form-outlined'
        }
      },
      {
        path: '/sys/user/index',
        name: 'sys:user',
        component: '/sys/user/index',
        meta: {
          title: '用户管理',
          icon: 'ant-design:form-outlined',
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
      },
      {
        path: '/sys/role/index',
        name: 'sys:role',
        component: '/sys/role/index',
        meta: {
          title: '角色管理',
          icon: 'ant-design:team-outlined',
          keepAlive: true,
          authList: [
            {
              title: '分页查询角色列表',
              authMark: 'sys:role:page'
            },
            {
              title: '新增角色',
              authMark: 'sys:role:save'
            },
            {
              title: '编辑角色',
              authMark: 'sys:role:update'
            },
            {
              title: '删除角色',
              authMark: 'sys:role:remove'
            }
          ]
        }
      },
      {
        path: '/sys/menu/index',
        name: 'sys:menu',
        component: '/sys/menu/index',
        meta: {
          title: '菜单管理',
          icon: 'ant-design:menu-outlined',
          keepAlive: true,
          authList: [
            {
              title: '分页查询菜单列表',
              authMark: 'sys:menu:tree'
            },
            {
              title: '新增菜单',
              authMark: 'sys:menu:save'
            },
            {
              title: '编辑菜单',
              authMark: 'sys:menu:update'
            },
            {
              title: '删除菜单',
              authMark: 'sys:menu:remove'
            }
          ]
        }
      }
    ]
  }
]
export default routes
