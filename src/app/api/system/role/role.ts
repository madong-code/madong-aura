import BaseService from '@/app/api/core/base';
import request from '@/utils/http';
import type { RoleRow } from './role-model';
import type { DeptTree } from '../dept/dept-model';


const baseUrl = '/system/role';

export const RoleService = {
  ...BaseService<RoleRow>({ baseUrl }),

  dataScope(id: number|string,data: Record<string, any>): Promise<RoleRow> {
    return request.put({ url: `${baseUrl}/${id}/data-scope`, data });
  },
  
  getScopeDeptTree(): Promise<DeptTree[]> {
    return request.get({ url: `${baseUrl}/scope/dept` });
  },
};

export default RoleService;
