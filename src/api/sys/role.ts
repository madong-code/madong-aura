import request from '@/utils/http'

export class RoleService {
  // 分页查询角色
  static page(params: any) {
    return request.post({
      url: '/sys/role/page',
      params
    })
  }
  // 添加角色
  static save(params: any) {
    return request.post({
      url: '/sys/role/save',
      params
    })
  }
  // 修改角色
  static update(params: any) {
    return request.post({
      url: '/sys/role/update',
      params
    })
  }
  // 删除角色
  static remove(params: any) {
    return request.post({
      url: '/sys/role/remove',
      params
    })
  }
  // 角色详情
  static detail(params: any) {
    return request.post({
      url: '/sys/role/detail',
      params
    })
  }
}
