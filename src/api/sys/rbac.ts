import request from '@/utils/http'

export class RbacService {
  // 分页查询
  static roleMenuIds(params: any) {
    return request.post({
      url: '/sys/rbac/roleMenuIds',
      params
    })
  }
}
