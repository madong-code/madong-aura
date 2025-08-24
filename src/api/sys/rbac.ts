import request from '@/utils/http'

export class RbacService {
  // 根据当前角色id获取菜单id
  static roleMenuIds(params: any) {
    return request.post({
      url: '/sys/rbac/roleMenuIds',
      params
    })
  }
  // 保存角色菜单关系
  static saveRoleMenu(params: any) {
    return request.post({
      url: '/sys/rbac/saveRoleMenu',
      params
    })
  }
}
