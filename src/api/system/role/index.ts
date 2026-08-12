import type { RoleRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/role';

export const RoleService = {
  ...BaseService<RoleRow>({ baseUrl }),

  updateDataScope(
    id: number | string,
    data: Record<string, any>,
  ): Promise<RoleRow> {
    return requestClient.put(`${baseUrl}/${id}/data-scope`, data);
  },

  getScopeDeptTree(): Promise<any[]> {
    return requestClient.get(`${baseUrl}/scope/dept`);
  },
};
