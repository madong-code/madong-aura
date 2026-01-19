import BaseService from '@/app/api/core/base';
import request from '@/utils/http';
import type { RouteRow } from './rule-model';

const baseUrl = '/system/role';

export const RuleService = {
  ...BaseService<RouteRow>({ baseUrl }),

  /**
* 列表
* @param params 
* @returns 
*/
  list(params?: Record<string, any>): Promise<RouteRow[]> {
    return request.get<RouteRow[]>({ url: `system/rule-list`, params });
  },

  /**
   * 类型
   * @param params 
   * @returns 
   */
  cate(params?: Record<string, any>): Promise<any[]> {
    return request.get({ url: `system/rule-cate`, params });
  },


  /**
   * 同步
   * @param data 
   * @returns 
   */
  sync(data: any): Promise<void> {
    return request.post({ url: `system/rule-sync`, data });
  }
};

export default RuleService;
