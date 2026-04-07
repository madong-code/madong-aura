import BaseService from '@/api/core/base';
import request from '@/utils/http';
import type { RouteRow } from './types';

const baseUrl = '/system/rule';

export const RuleService = {
  ...BaseService<RouteRow>({ baseUrl }),

  /**
   * 列表（扫描模式）
   * @param params 
   * @returns 
   */
  list(params?: Record<string, any>): Promise<RouteRow[]> {
    return request.get<RouteRow[]>({ url: `system/rule`, params });
  },

  /**
   * 类型（扫描模式，基于tags）
   * @param params 
   * @returns 
   */
  cate(params?: Record<string, any>): Promise<any[]> {
    return request.get({ url: `system/rule-cate`, params });
  },


  /**
   * 刷新扫描缓存
   * @param data 
   * @returns 
   */
  sync(data?: any): Promise<void> {
    return request.post({ url: `system/rule/refresh`, data });
  }
};

export default RuleService;
