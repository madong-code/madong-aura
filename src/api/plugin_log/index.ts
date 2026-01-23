import BaseService from '@/app/api/core/base';
import type { PostRow } from './model';

const baseUrl = '/system/post';

export const PostService = {
  ...BaseService<PostRow>({ baseUrl }),
};

export default PostService;
