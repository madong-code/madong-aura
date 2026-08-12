import { requestClient } from '#/api/request';

const baseUrl = '/system/config';

export const ConfigService = {
  getByCode($code: string, params?: Record<string, any>) {
    return requestClient.get(`${baseUrl}/code/${$code}`, { params });
  },
  getByGroup(groupCode: string, params?: Record<string, any>) {
    return requestClient.get(`${baseUrl}/group/${groupCode}`, { params });
  },
  getItems(params: Record<string, any>) {
    return requestClient.get(`${baseUrl}/items`, { params });
  },
  update(code: string, data: Record<string, any>) {
    return requestClient.put(`${baseUrl}/${code}`, data);
  },
  save(data: Record<string, any>) {
    return requestClient.post(baseUrl, data);
  },
  delete(code: string) {
    return requestClient.delete(`${baseUrl}/${code}`);
  },
};
