import request from '@/utils/http'

export class DeptService {
  // 部门树
  static tree(params: any) {
    return request.post({
      url: '/sys/dept/tree',
      params
    })
  }
}
