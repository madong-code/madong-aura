/**
 * 单元格图标渲染器
 * - 若列字段本身就是图标名（如 icon 列），则渲染该图标
 * - 若列字段是文本（如 name/title），且行存在 icon 字段，则以「图标 + 文本」形式渲染（图标置于文本前）
 */
import { Icon } from '#/components/icon';

export const CellIconRenderer = {
  renderTableDefault(_renderOpts: any, { column, row }: any) {
    const value = row[column.field];
    const icon = row.icon;

    // 当前列字段本身是图标名（如 icon 列）
    if (column.field === 'icon') {
      if (!value) {
        return <span>-</span>;
      }
      return (
        <span class="flex items-center justify-center">
          <Icon class="size-5" icon={value} />
        </span>
      );
    }

    // 文本列 + 行带图标：图标置于文字前（参考权限规则中 icon 置于 title 前）
    if (icon) {
      return (
        <span class="flex items-center gap-1.5">
          <Icon class="size-4" icon={icon} />
          <span>{value}</span>
        </span>
      );
    }

    return <span>{value}</span>;
  },
};
