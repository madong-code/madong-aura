import type { Menu } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/web/menu';

export const WebMenuService = {
  ...BaseService<Menu>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),
};
