import BaseService from '@/api/core/base';
import type { PluginDevelopRow } from './types';
import request from '@/utils/http';

const baseUrl = '/plugin/develop';

export const PluginDevelopService = {
  ...BaseService<PluginDevelopRow>({ baseUrl }),

  /**
   * 打包插件
   * @param pluginKey 插件标识
   */
  build(pluginKey: string) {
    return request.post({
      url: `${baseUrl}/build`,
      data: { plugin_key: pluginKey },
    });
  },

  /**
   * 更新插件
   * @param id 插件ID
   * @param data 更新数据
   */
  update(id: number, data: Partial<PluginDevelopRow>) {
    return request.put({
      url: `${baseUrl}/${id}`,
      data,
    });
  },

  /**
   * 确认保存图片到插件目录
   * @param id 插件ID
   * @param icon 图标base64
   * @param cover 封面base64
   */
  confirmImages(id: number, icon?: string, cover?: string) {
    return request.post({
      url: `${baseUrl}/confirm-images/${id}`,
      data: { icon, cover },
    });
  },
};

export default PluginDevelopService;
