import request from '@/utils/http'

export class UserService {
  // 登录
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      url: '/sys/login',
      params
      // showErrorMessage: false // 不显示错误消息
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.post<Api.User.UserInfo>({
      url: '/sys/user/info'
    })
  }
  // 获取用户权限码
  static getPermCode() {
    return request.post<string[]>({
      url: '/sys/user/permCode'
    })
  }

  // 获取用户列表
  static getUserList(params: Api.Common.PaginatingSearchParams) {
    return request.post<Api.User.UserListData>({
      url: '/sys/user/page',
      params
    })
  }
}
