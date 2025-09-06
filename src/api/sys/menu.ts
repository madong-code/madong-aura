import { AppRouteRecord } from '@/types'
import request from '@/utils/http'

export class MenuService {
  // 菜单树
  static tree(params: any) {
    return request.post({
      url: '/sys/menu/tree',
      params
    })
  }
  // 添加菜单
  static save(params: any) {
    return request.post({
      url: '/sys/menu/save',
      params
    })
  }
  // 修改菜单
  static update(params: any) {
    return request.post({
      url: '/sys/menu/update',
      params
    })
  }
  // 删除菜单
  static remove(params: any) {
    return request.post({
      url: '/sys/menu/remove',
      params
    })
  }
  // 菜单详情
  static detail(params: any) {
    return request.post({
      url: '/sys/menu/detail',
      params
    })
  }
  static async getMenuList(): Promise<any> {
    const menuList = await request.get<AppRouteRecord[]>({
      url: '/getArtDesignMenu'
    })
    return { menuList }
  }
}
