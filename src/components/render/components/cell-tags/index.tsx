/**
 * 单元格多标签渲染器 - 纯 TSX 实现
 * 支持数组和单值，自动渲染为多个 ElTag
 */
import { ElTag } from 'element-plus';

const typeMap: Record<string, string> = {
  success: 'success',
  primary: 'primary',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

export const CellTagsRenderer = {
  renderTableDefault(
    renderOpts: {
      attrs?: { color?: string; effect?: string; labelKey?: string };
    },
    params: { column: { field: string }; row: Record<string, any> },
  ) {
    const { column, row } = params;
    const color = renderOpts?.attrs?.color ?? '';
    const effect = renderOpts?.attrs?.effect ?? 'plain';
    const labelKey = renderOpts?.attrs?.labelKey ?? 'name';

    let value = row[column.field];

    // 统一转为数组处理
    if (!Array.isArray(value)) {
      value = value === null || value === undefined ? [] : [value];
    }

    // 过滤空值（null、undefined、空字符串）
    const items = value.filter((item: any) => {
      if (item === null || item === undefined) return false;
      if (typeof item === 'object') {
        const label = item[labelKey];
        return label !== null && label !== undefined && label !== '';
      }
      return String(item) !== '';
    });

    // 全部为空时显示占位符
    if (items.length === 0) {
      return <span class="text-muted-foreground">-</span>;
    }

    const tagType = typeMap[color] || '';

    return (
      <span class="flex flex-wrap gap-1">
        {items.map((item: any, index: number) => {
          const label =
            typeof item === 'object'
              ? (item[labelKey] ?? String(item))
              : String(item);
          return (
            <ElTag
              effect={effect as any}
              key={index}
              size="small"
              type={tagType as any}
            >
              {label}
            </ElTag>
          );
        })}
      </span>
    );
  },
};
