import BaseService from '@/app/api/core/base';
import request from '@/utils/http';
import type { RecycleBinRow } from './recycle-bin-model';

const baseUrl = '/system/recycle';

export const RecycleBinService = {
  ...BaseService<RecycleBinRow>({ baseUrl }),

  restore(data: Record<string, any>) {
    return request.put({ url: baseUrl, data });
  },
};

export default RecycleBinService;
