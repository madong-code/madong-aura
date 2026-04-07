import BaseService from '@/api/core/base';
import request from '@/utils/http';
import type { Link } from './types';

const baseUrl = '/web/link';

export const LinkService = {
  ...BaseService<Link>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  })
};

export default LinkService;
