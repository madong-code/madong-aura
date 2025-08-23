import request from '@/utils/http'

export class DeptService {
  // 分页查询
  static page(params: any) {
    return request.post({
      url: '/sys/dept/page',
      params
    })
  }

  // 树形接口
  static tree(params: any) {
    return request.post({
      url: '/sys/dept/tree',
      params
    })
  }

  // 添加
  static save(params: any) {
    return request.post({
      url: '/sys/dept/save',
      params
    })
  }

  // 修改
  static update(params: any) {
    return request.post({
      url: '/sys/dept/update',
      params
    })
  }

  // 删除
  static remove(params: any) {
    return request.post({
      url: '/sys/dept/remove',
      params
    })
  }

  // 详情
  static detail(params: any) {
    return request.post({
      url: '/sys/dept/detail',
      params
    })
  }
}
