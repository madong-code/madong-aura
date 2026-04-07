import BaseService from '@/api/core/base';
import type { PostRow } from './types';

const baseUrl = '/org/post';

export const PostService = {
  ...BaseService<PostRow>({ baseUrl }),
};

export default PostService;
