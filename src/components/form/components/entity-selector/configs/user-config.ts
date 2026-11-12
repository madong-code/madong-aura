/**
 * 内置「用户选择器」配置。
 *
 * 取数走 /system/admin 通用列表（服务端分页）；
 * ctx.deptIds 有值时按 IN_dept_id 过滤，实现「限定部门 → 只能选该部门（含子部门）下人员」。
 */
import type { EntityPickerConfig } from '../core/selector-types';

import { UserService } from '#/api/system/user';

export const userPickerConfig: EntityPickerConfig = {
  type: 'user',
  title: '选择用户',
  placeholder: '选择用户',
  deptField: 'dept_id',
  columns: [
    { field: 'real_name', title: '姓名', minWidth: 120, align: 'left' },
    { field: 'user_name', title: '账号', minWidth: 140, align: 'left' },
    { field: 'mobile_phone', title: '手机号', width: 140, align: 'left' },
  ],
  searchFields: [
    { label: '姓名', value: 'real_name' },
    { label: '账号', value: 'user_name' },
    { label: '手机号', value: 'mobile_phone' },
  ],
  async fetcher({ page, limit, keyword, field, extra }) {
    const params: Record<string, any> = { page, limit };
    if (keyword) params[`LIKE_${field}`] = keyword;
    // 部门联动：限定部门（含子部门）内可选；IN_ 需传数组（后端约定）
    const deptIds: string[] = extra?.deptIds ?? [];
    if (deptIds.length > 0) params.IN_dept_id = deptIds;
    const res: any = await UserService.list(params);
    return { items: res?.items ?? [], total: Number(res?.total ?? 0) };
  },
  async hydrate(id) {
    const res: any = await UserService.list({ EQ_id: id, limit: 1 });
    return res?.items?.[0] ?? null;
  },
  labelOf: (row) => {
    const name = String(row?.real_name ?? '').trim();
    const account = String(row?.user_name ?? '').trim();
    if (name && account) return `${name}(${account})`;
    return name || account || String(row?.id ?? '');
  },
};
