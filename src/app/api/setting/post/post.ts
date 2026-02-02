import BaseService from '@/app/api/core/base';
import type { PostRow } from './post-model';

const baseUrl = '/org/post';

export const PostService = {
  ...BaseService<PostRow>({ baseUrl }),
};

export default PostService;
