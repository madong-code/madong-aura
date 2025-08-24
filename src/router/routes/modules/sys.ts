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
          icon: 'ant-design:user-outlined',
          keepAlive: true,
          authList: [
            {
              title: '列表',
              authMark: 'sys:user:page'
            },
            {
              title: '详情',
              authMark: 'sys:user:destail'
            },
            {
              title: '新增',
              authMark: 'sys:user:save'
            },
            {
              title: '编辑',
              authMark: 'sys:user:update'
            },
            {
              title: '删除',
              authMark: 'sys:user:remove'
            }
          ]
        }
      },
      {
        path: '/sys/user/online-user-list',
        name: 'sys:onlineUserList',
        component: '/sys/user/online-user-list',
        meta: {
          title: '在线用户',
          icon: 'ant-design:cloud-server-outlined',
          keepAlive: true,
          authList: [
            {
              title: '在线用户详情',
              authMark: 'btn:onlineUser:detail'
            },
            {
              title: '强制注销用户',
              authMark: 'sys:user:logoutByLoginId'
            },
            {
              title: '将用户踢下线',
              authMark: 'sys:user:kickoutByLoginId'
            },
            {
              title: '强制注销Token凭证',
              authMark: 'sys:user:logoutByTokenValue'
            },
            {
              title: '将Token凭证踢下线',
              authMark: 'sys:user:kickoutByTokenValue'
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
              title: '列表',
              authMark: 'sys:role:page'
            },
            {
              title: '详情',
              authMark: 'sys:role:detail'
            },
            {
              title: '新增',
              authMark: 'sys:role:save'
            },
            {
              title: '编辑',
              authMark: 'sys:role:update'
            },
            {
              title: '删除',
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
              title: '列表',
              authMark: 'sys:menu:tree'
            },
            {
              title: '详情',
              authMark: 'sys:menu:detail'
            },
            {
              title: '新增',
              authMark: 'sys:menu:save'
            },
            {
              title: '编辑',
              authMark: 'sys:menu:update'
            },
            {
              title: '删除',
              authMark: 'sys:menu:remove'
            }
          ]
        }
      },
      {
        path: '/sys/post/index',
        name: 'sys:post',
        component: '/sys/post/index',
        meta: {
          title: '岗位管理',
          icon: 'ant-design:share-alt-outlined',
          keepAlive: true,
          authList: [
            {
              title: '列表',
              authMark: 'sys:post:page'
            },
            {
              title: '详情',
              authMark: 'sys:post:detail'
            },
            {
              title: '新增',
              authMark: 'sys:post:save'
            },
            {
              title: '编辑',
              authMark: 'sys:post:update'
            },
            {
              title: '删除',
              authMark: 'sys:post:remove'
            }
          ]
        }
      },
      {
        path: '/sys/dept/index',
        name: 'sys:dept',
        component: '/sys/dept/index',
        meta: {
          title: '部门管理',
          icon: 'ant-design:deployment-unit-outlined',
          keepAlive: true,
          authList: [
            {
              title: '部门树',
              authMark: 'sys:dept:tree'
            },
            {
              title: '详情',
              authMark: 'sys:dept:detail'
            },
            {
              title: '新增',
              authMark: 'sys:dept:save'
            },
            {
              title: '编辑',
              authMark: 'sys:dept:update'
            },
            {
              title: '删除',
              authMark: 'sys:dept:remove'
            }
          ]
        }
      },
      {
        path: '/sys/dict/index',
        name: 'sys:dict',
        component: '/sys/dict/index',
        meta: {
          title: '数据字典',
          icon: 'ant-design:database-outlined',
          keepAlive: true,
          authList: [
            {
              title: '列表',
              authMark: 'sys:dict:page'
            },
            {
              title: '新增',
              authMark: 'sys:dict:save'
            },
            {
              title: '编辑',
              authMark: 'sys:dict:update'
            },
            {
              title: '删除',
              authMark: 'sys:dict:remove'
            },
            {
              title: '字典项列表',
              authMark: 'sys:dictItem:page'
            },
            {
              title: '新增字典项',
              authMark: 'sys:dictItem:save'
            },
            {
              title: '编辑字典项',
              authMark: 'sys:dictItem:update'
            },
            {
              title: '删除字典项',
              authMark: 'sys:dictItem:remove'
            }
          ]
        }
      },
      {
        path: '/sys/config/index',
        name: 'sys:config',
        component: '/sys/config/index',
        meta: {
          title: '参数配置',
          icon: 'ant-design:file-text-outlined',
          keepAlive: true,
          authList: [
            {
              title: '列表',
              authMark: 'sys:config:page'
            },
            {
              title: '详情',
              authMark: 'sys:config:detail'
            },
            {
              title: '新增',
              authMark: 'sys:config:save'
            },
            {
              title: '编辑',
              authMark: 'sys:config:update'
            },
            {
              title: '删除',
              authMark: 'sys:config:remove'
            }
          ]
        }
      }
    ]
  }
]
export default routes
