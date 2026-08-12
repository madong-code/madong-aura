/**
 * 单元格图片渲染器
 */
import { ElImage } from 'element-plus';

export const CellImageRenderer = {
  renderTableDefault(_renderOpts: any, { column, row }: any) {
    return <ElImage src={row[column.field]} />;
  },
};
