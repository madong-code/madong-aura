import request from '@/utils/http'

export class DictItemService {
  // 分页查询
  static page(params: any) {
    return request.post({
      url: '/sys/dictItem/page',
      params
    })
  }

  // 添加
  static save(params: any) {
    return request.post({
      url: '/sys/dictItem/save',
      params
    })
  }

  // 修改
  static update(params: any) {
    return request.post({
      url: '/sys/dictItem/update',
      params
    })
  }

  // 删除
  static remove(params: any) {
    return request.post({
      url: '/sys/dictItem/remove',
      params
    })
  }

  // 详情
  static detail(params: any) {
    return request.post({
      url: '/sys/dictItem/detail',
      params
    })
  }
}
