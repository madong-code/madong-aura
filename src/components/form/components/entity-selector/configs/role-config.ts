/**
 * 内置「角色选择器」配置。
 *
 * 取数走 /system/role 通用列表（服务端分页）。角色不属于部门维度，
 * 不参与部门联动（deptField 未声明），可选范围天然全量。
 */
import type { EntityPickerConfig } from '../core/selector-types';

import { RoleService } from '#/api/system/role';

export const rolePickerConfig: EntityPickerConfig = {
  type: 'role',
  title: '选择角色',
  placeholder: '选择角色',
  columns: [
    { field: 'name', title: '角色名称', minWidth: 160, align: 'left' },
    { field: 'code', title: '角色编码', width: 160, align: 'left' },
  ],
  searchFields: [
    { label: '名称', value: 'name' },
    { label: '编码', value: 'code' },
  ],
  async fetcher({ page, limit, keyword, field }) {
    const params: Record<string, any> = { page, limit };
    if (keyword) params[`LIKE_${field}`] = keyword;
    const res: any = await RoleService.list(params);
    return { items: res?.items ?? [], total: Number(res?.total ?? 0) };
  },
  async hydrate(id) {
    const res: any = await RoleService.list({ EQ_id: id, limit: 1 });
    return res?.items?.[0] ?? null;
  },
  labelOf: (row) => String(row?.name ?? row?.id ?? ''),
};
