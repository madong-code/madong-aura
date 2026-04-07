import BaseService from '@/api/core/base';
import request from '@/utils/http';
import type { Menu } from './types';

const baseUrl = '/web/menu';

export const MenuService = {
  ...BaseService<Menu>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  })
};

export default MenuService;
