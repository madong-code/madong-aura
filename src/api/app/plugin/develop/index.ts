import type { PluginListResponse } from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/plugin/develop';

export const AppPluginDevelopService = {
  /** 获取插件列表 */
  getList(params?: {
    keyword?: string;
    limit?: number;
    page?: number;
  }): Promise<PluginListResponse> {
    return requestClient.get(baseUrl, { params });
  },

  /** 获取插件详情 */
  getDetail(id: string): Promise<any> {
    return requestClient.get(`${baseUrl}/${id}`);
  },

  /** 创建插件 */
  create(data: Record<string, any>): Promise<any> {
    return requestClient.post(baseUrl, data);
  },

  /** 更新插件 */
  update(id: string, data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/${id}`, data);
  },

  /** 打包插件 */
  build(id: string): Promise<any> {
    return requestClient.post(`${baseUrl}/${id}/build`);
  },

  /** 删除插件 */
  remove(id: string): Promise<any> {
    return requestClient.delete(`${baseUrl}/${id}`);
  },
  batchRemove(ids: string[]): Promise<any> {
    return requestClient.delete(baseUrl, { data: ids });
  },
};
