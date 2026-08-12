import type { Link } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/web/link';

export const LinkService = {
  ...BaseService<Link>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),
};
