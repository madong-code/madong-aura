import request from '@/utils/http'

export class DictService {
  // 分页查询
  static page(params: any) {
    return request.post({
      url: '/sys/dict/page',
      params
    })
  }

  // 添加
  static save(params: any) {
    return request.post({
      url: '/sys/dict/save',
      params
    })
  }

  // 修改
  static update(params: any) {
    return request.post({
      url: '/sys/dict/update',
      params
    })
  }

  // 删除
  static remove(params: any) {
    return request.post({
      url: '/sys/dict/remove',
      params
    })
  }

  // 详情
  static detail(params: any) {
    return request.post({
      url: '/sys/dict/detail',
      params
    })
  }
}
