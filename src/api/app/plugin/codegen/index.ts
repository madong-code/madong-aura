import type { GeneratorListResponse } from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/codegen/generator/code';

export const GeneratorCodeService = {
  /** 获取列表 */
  getList(params?: any): Promise<GeneratorListResponse> {
    return requestClient.get(baseUrl, { params });
  },

  /** 获取详情 */
  get(id: number | string): Promise<any> {
    return requestClient.get(`${baseUrl}/${id}`);
  },

  /** 新增 */
  create(data: any): Promise<any> {
    return requestClient.post(baseUrl, data);
  },

  /** 修改 */
  update(id: number | string, data: any): Promise<any> {
    return requestClient.put(`${baseUrl}/${id}`, data);
  },

  /** 删除 */
  remove(id: number | string): Promise<any> {
    return requestClient.delete(`${baseUrl}/${id}`);
  },

  /** 批量删除 */
  batchRemove(data: { ids: (number | string)[] }): Promise<any> {
    return requestClient.delete(baseUrl, { data });
  },

  /** 获取插件开发列表 */
  getPluginDevList(params?: any): Promise<any> {
    return requestClient.get('/plugin/select', { params });
  },

  /** 预览代码 */
  getPreview(id: number | string): Promise<any> {
    return requestClient.get(`${baseUrl}/${id}/preview`);
  },

  /** 下载代码 */
  download(id: number | string, params?: any): Promise<Blob> {
    return requestClient.download(`${baseUrl}/${id}/download`, {
      params,
      timeout: 20 * 1000,
    });
  },

  /** 部署代码 */
  deploy(id: number | string, params?: any): Promise<any> {
    return requestClient.put(`${baseUrl}/${id}/deploy`, params);
  },
};
