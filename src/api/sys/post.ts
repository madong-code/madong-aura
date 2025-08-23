import request from '@/utils/http'

export class PostService {
  // 分页查询
  static page(params: any) {
    return request.post({
      url: '/sys/post/page',
      params
    })
  }

  // 添加
  static save(params: any) {
    return request.post({
      url: '/sys/post/save',
      params
    })
  }

  // 修改
  static update(params: any) {
    return request.post({
      url: '/sys/post/update',
      params
    })
  }

  // 删除
  static remove(params: any) {
    return request.post({
      url: '/sys/post/remove',
      params
    })
  }

  // 详情
  static detail(params: any) {
    return request.post({
      url: '/sys/post/detail',
      params
    })
  }
}
