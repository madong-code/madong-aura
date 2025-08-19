import request from '@/utils/http'

export class UserService {
  // 分页查询用户
  static page(params: any) {
    return request.post({
      url: '/sys/user/page',
      params
    })
  }
  // 添加用户
  static save(params: any) {
    return request.post({
      url: '/sys/user/save',
      params
    })
  }
  // 修改用户
  static update(params: any) {
    return request.post({
      url: '/sys/user/update',
      params
    })
  }
  // 删除用户
  static remove(params: any) {
    return request.post({
      url: '/sys/user/remove',
      params
    })
  }
  // 用户详情
  static detail(params: any) {
    return request.post({
      url: '/sys/user/detail',
      params
    })
  }
}
