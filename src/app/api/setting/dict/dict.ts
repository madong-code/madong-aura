import BaseService from "@/app/api/core/base";
import type { DictOptions, DictRow } from "./dict-model";
import request from '@/utils/http';

const baseUrl = '/dict/dict';

export const DictService = {
  ...BaseService<DictRow>({ baseUrl }),

  enumDictList(params: any): Promise<DictRow[]> {
    return request.get({ url: `${baseUrl}/enum-dict-list`, params });
  },

  customDictList(params: any): Promise<DictRow[]> {
    return request.get({ url: `${baseUrl}/custom/list`, params });
  },

  getByDictType(params: any): Promise<DictOptions[]> {
    return request.get({ url: `${baseUrl}/options/by-type`, params });
  },

  getAllDict(params: any): Promise<any[]> {
    return request.get({ url: `${baseUrl}/enum/list`, params });
  },

};

export default DictService;
