import { AppRouteRecord } from '@/types/router'
import request from '@/utils/http'

interface MenuResponse {
  menuList: AppRouteRecord[]
}

// 菜单接口
export const menuService = {
  async getMenuList(): Promise<MenuResponse> {
    const menuList = await request.get<AppRouteRecord[]>({
      url: '/getArtDesignMenu2'
    })
    return { menuList }
  }
}
