/**
 * 内置「职位选择器」配置。
 *
 * 取数走 /system/post 通用列表（服务端分页）；职位挂 dept_id，
 * ctx.deptIds 有值时按 IN_dept_id 过滤——上级部门变更时仅该部门（含子部门）下职位可选。
 */
import type { EntityPickerConfig } from '../core/selector-types';

import { PostService } from '#/api/system/post';

export const postPickerConfig: EntityPickerConfig = {
  type: 'post',
  title: '选择职位',
  placeholder: '选择职位',
  deptField: 'dept_id',
  columns: [
    { field: 'name', title: '职位名称', minWidth: 160, align: 'left' },
    { field: 'code', title: '职位编码', width: 160, align: 'left' },
  ],
  searchFields: [
    { label: '名称', value: 'name' },
    { label: '编码', value: 'code' },
  ],
  async fetcher({ page, limit, keyword, field, extra }) {
    const params: Record<string, any> = { page, limit };
    if (keyword) params[`LIKE_${field}`] = keyword;
    // 部门联动：仅限定部门（含子部门）下职位可选；IN_ 需传数组（后端约定）
    const deptIds: string[] = extra?.deptIds ?? [];
    if (deptIds.length > 0) params.IN_dept_id = deptIds;
    const res: any = await PostService.list(params);
    return { items: res?.items ?? [], total: Number(res?.total ?? 0) };
  },
  async hydrate(id) {
    const res: any = await PostService.list({ EQ_id: id, limit: 1 });
    return res?.items?.[0] ?? null;
  },
  labelOf: (row) => String(row?.name ?? row?.id ?? ''),
};
