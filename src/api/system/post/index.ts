import type { PostRow } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/system/post';

export const PostService = {
  ...BaseService<PostRow>({ baseUrl }),
  getList: BaseService<PostRow>({ baseUrl }).list,
};
