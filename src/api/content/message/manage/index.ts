import type { ManageRecord } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/content/message/manage';

export const ManageService = {
  ...BaseService<ManageRecord>({ baseUrl }),
};

/** 消息定义-模板关联 API */
export const ManageTemplateApi = {
  /** 获取已关联的模板ID列表 */
  getAssignedIds(id: number | string): Promise<number[]> {
    return requestClient.get(`/content/message/manage/${id}/templates`);
  },

  /** 同步模板关联（全量覆盖） */
  syncTemplates(
    id: number | string,
    templateIds: (number | string)[],
  ): Promise<any> {
    return requestClient.post(`/content/message/manage/${id}/templates`, {
      template_ids: templateIds,
    });
  },
};
