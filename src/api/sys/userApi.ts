import request from '@/utils/http'

export class UserService {
  // 获取用户列表
  static page(params: any) {
    return request.post({
      url: '/sys/user/page',
      params
    })
  }
  // 下拉列表
  static select(params: any) {
    return request.post({
      url: '/sys/user/select',
      params
    })
  }
}
