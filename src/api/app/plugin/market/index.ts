import type { ModuleListResponse } from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/plugin';

export const AppPluginMarketService = {
  /** 获取模块市场列表 */
  getList(params?: {
    keyword?: string;
    limit?: number;
    page?: number;
    type?: string;
  }): Promise<ModuleListResponse> {
    return requestClient.get(baseUrl, { params });
  },

  /** 获取插件详情 */
  getDetail(key: string): Promise<any> {
    return requestClient.get(`${baseUrl}/${key}`);
  },

  /** 获取升级日志 */
  getUpgradeLogs(key: string): Promise<any> {
    return requestClient.get(`${baseUrl}/${key}/upgrade-logs`);
  },

  /** 环境检测 */
  checkEnvironment(key: string): Promise<any> {
    return requestClient.get(`${baseUrl}/${key}/check-environment`);
  },
};
