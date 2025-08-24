import request from '@/utils/http'

export class ConfigService {
  // 分页查询
  static page(params: any) {
    return request.post({
      url: '/sys/config/page',
      params
    })
  }

  // 添加
  static save(params: any) {
    return request.post({
      url: '/sys/config/save',
      params
    })
  }

  // 修改
  static update(params: any) {
    return request.post({
      url: '/sys/config/update',
      params
    })
  }

  // 删除
  static remove(params: any) {
    return request.post({
      url: '/sys/config/remove',
      params
    })
  }

  // 详情
  static detail(params: any) {
    return request.post({
      url: '/sys/config/detail',
      params
    })
  }
}
