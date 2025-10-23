import request from '@/utils/http';

const baseUrl = '/system/config';

export const ConfigService = {
  get(params?: Record<string, any>) {
    return request.get({ url: `${baseUrl}/info`, params });
  },

  save(data: Record<string, any>) {
    return request.post({ url: baseUrl, data });
  },
};

// 兼容早期版本，直接复用
export const info = ConfigService.get;
export const saveConfig = ConfigService.save;

export default ConfigService;
