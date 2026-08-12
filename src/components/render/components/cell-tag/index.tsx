/**
 * 单元格标签渲染器 - 纯 TSX 实现
 */
import { ElTag } from 'element-plus';

interface TagOption {
  value: any;
  label: string;
  color?: string;
  effect?: 'dark' | 'light' | 'plain';
}

const typeMap: Record<string, string> = {
  success: 'success',
  primary: 'primary',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

export const CellTagRenderer = {
  renderTableDefault(
    renderOpts: { attrs?: { options?: TagOption[] } },
    params: { column: { field: string }; row: Record<string, any> },
  ) {
    const { column, row } = params;
    const options = renderOpts?.attrs?.options ?? [
      { value: 1, label: '启用', color: 'success', effect: 'light' },
      { value: 0, label: '禁用', color: 'danger', effect: 'light' },
    ];
    const value = row[column.field];
    const tagItem = options.find((item) => item.value === value);
    const label = tagItem?.label ?? String(value ?? '');
    const tagType = typeMap[tagItem?.color || ''] || 'info';
    const effect = tagItem?.effect ?? 'light';

    return (
      <ElTag effect={effect} size="small" type={tagType as any}>
        {label}
      </ElTag>
    );
  },
};
