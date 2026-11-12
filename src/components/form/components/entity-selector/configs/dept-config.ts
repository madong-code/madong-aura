/**
 * 内置「部门选择器」配置。
 *
 * 部门为树形组织数据，取数走部门树 + 客户端关键词过滤 + 客户端分页：
 * - 与联动机制天然一致：fetcher ctx.deptIds 有值时，树先裁剪为限定子树再展平，
 *   可选数据严格限定在传入部门（含子部门）内；
 * - 部门量级（ERP/OA/MES 组织树通常 < 数千节点）客户端分页足够，且避免 IN_ 超长参数。
 */
import type { EntityPickerConfig } from '../core/selector-types';

import { findDeptNode, flattenTree, indentName, loadDeptTree, pruneTree } from './dept-tree';

export const deptPickerConfig: EntityPickerConfig = {
  type: 'dept',
  title: '选择部门',
  placeholder: '选择部门',
  // 部门实体的「部门外键」是自身 id：联动校验时判断选中 id 是否在限定集合内
  deptField: 'id',
  columns: [
    {
      field: 'name',
      title: '部门名称',
      minWidth: 220,
      align: 'left',
      formatter: (params: any) => indentName(params.row),
    },
    { field: 'code', title: '部门编码', width: 150, align: 'left' },
  ],
  searchFields: [
    { label: '名称', value: 'name' },
    { label: '编码', value: 'code' },
  ],
  async fetcher({ page, limit, keyword, field, extra }) {
    const tree = await loadDeptTree();
    const deptRootIds: string[] = extra?.deptRootIds ?? [];
    // 强制限定传入部门：先裁剪为限定子树，再展平供选择
    const scoped = deptRootIds.length > 0 ? pruneTree(tree, deptRootIds) : tree;
    const kw = keyword.trim().toLowerCase();
    let rows = flattenTree(scoped);
    if (kw) {
      rows = rows.filter((row) =>
        String(row?.[field] ?? '').toLowerCase().includes(kw),
      );
    }
    const total = rows.length;
    const start = (page - 1) * limit;
    return { items: rows.slice(start, start + limit), total };
  },
  async hydrate(id) {
    const tree = await loadDeptTree();
    return findDeptNode(tree, id);
  },
  labelOf: (row) => String(row?.name ?? row?.id ?? ''),
};
