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
  // 根据登录ID踢出用户
  static kickoutByLoginId(params: any) {
    return request.post({
      url: '/sys/user/kickoutByLoginId',
      params
    })
  }

  // 根据登录ID登出用户
  static logoutByLoginId(params: any) {
    return request.post({
      url: '/sys/user/logoutByLoginId',
      params
    })
  }
  // 根据登录token踢出用户
  static kickoutByTokenValue(params: any) {
    return request.post({
      url: '/sys/user/kickoutByTokenValue',
      params
    })
  }

  // 根据登录token登出用户
  static logoutByTokenValue(params: any) {
    return request.post({
      url: '/sys/user/logoutByTokenValue',
      params
    })
  }

  // 在线用户列表
  static onlineUserList(params: any) {
    return request.post({
      url: '/sys/user/onlineUserList',
      params
    })
  }
  // 授权角色
  static grantRole(params: any) {
    return request.post({
      url: '/sys/user/grantRole',
      params
    })
  }
}
