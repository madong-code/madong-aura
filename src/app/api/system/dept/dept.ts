import BaseService from "@/api/core/base";
import type { DeptRow, DeptTree } from "./dept-model";
import request from '@/utils/http';

const baseUrl = '/system/dept';

export const DeptService = {
  ...BaseService<DeptRow>({ baseUrl }),

  getTree(args?: Record<string, any>): Promise<DeptTree[]> {
    const params = { ...args, format: 'tree' };
    return request.get<DeptTree[]>({ url: baseUrl, params });
  },
};

export default DeptService;
