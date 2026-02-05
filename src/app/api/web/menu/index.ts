import BaseService from '@/app/api/core/base';
import request from '@/utils/http';
import type { Menu } from './menu-model';

const baseUrl = '/web/menu';

export const MenuService = {
  ...BaseService<Menu>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  })
};

export default MenuService;
