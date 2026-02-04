import BaseService from '@/app/api/core/base';
import request from '@/utils/http';
import type { Menu } from './menu-model';

const baseUrl = '/web/menu';

export const MenuService = {
  ...BaseService<Menu>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),

  list(params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}`, params });
  },

  detail(id: number): Promise<Menu> {
    return request.get({ url: `${baseUrl}/${id}` });
  },

  add(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}`, data });
  },

  edit(id: number, data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/${id}`, data });
  },

  delete(id: number): Promise<any> {
    return request.delete({ url: `${baseUrl}/${id}` });
  }
};

export default MenuService;
