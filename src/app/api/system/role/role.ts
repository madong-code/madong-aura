import BaseService from '@/app/api/core/base';
import request from '@/utils/http';
import type { RoleRow } from './role-model';

const baseUrl = '/system/role';

export const RoleService = {
  ...BaseService<RoleRow>({ baseUrl }),

  dataScope(data: Record<string, any>): Promise<RoleRow> {
    return request.put({ url: `${baseUrl}/data-scope`, data });
  }
};

export default RoleService;
