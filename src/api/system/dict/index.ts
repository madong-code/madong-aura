import type { DictItemRow, DictOptions, DictRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/dict';
const dictItemBaseUrl = '/system/dict-item';

export const DictService = {
  ...BaseService<DictRow>({ baseUrl }),

  enumDictList(params: any): Promise<DictRow[]> {
    return requestClient.get(`${baseUrl}/enum-dict-list`, { params });
  },

  customDictList(params: any): Promise<DictRow[]> {
    return requestClient.get(`${baseUrl}/custom/list`, { params });
  },

  getByDictType(params: any): Promise<DictOptions[]> {
    return requestClient.get(`${baseUrl}/options/by-type`, { params });
  },

  getAllDict(params: any): Promise<any[]> {
    return requestClient.get(`${baseUrl}/enum/list`, { params });
  },
};

export const DictItemService = {
  ...BaseService<DictItemRow>({ baseUrl: dictItemBaseUrl }),
};
