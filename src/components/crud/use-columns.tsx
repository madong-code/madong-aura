import type { Ref } from 'vue';

import type { ActionItem } from './components/table-action';
import type { CrudColumn } from './types';

import { computed } from 'vue';

import { $t } from '#/locales';

import { TableAction } from './components/table-action';

/**
 * 框架内置对齐规则：未显式指定 align 时，状态列 / 时间列默认居中，其余继承全局 grid.align
 */
const BUILTIN_CENTER_COLUMNS = (col: CrudColumn) =>
  col.cellRender?.name === 'CellDictTag' ||
  col.cellRender?.name === 'CellDict' ||
  /(_at|_time)$|^(created|updated|create|update|time|date)/i.test(
    String(col.field ?? ''),
  );

interface UseColumnsOptions {
  /** 列定义数组或其工厂函数（工厂函数可让 $t 在语言切换时重新求值） */
  columns: (() => CrudColumn[]) | CrudColumn[];
  tableActionColumn?: Partial<CrudColumn>;
}

export function useColumns(
  options: UseColumnsOptions,
  tableActions: Ref<ActionItem[]>,
  dropDownActions: Ref<ActionItem[]>,
) {
  return computed(() => {
    // 每次求值都重新取列定义，保证列标题内的 $t 能跟随语言切换更新
    const rawColumns =
      typeof options.columns === 'function'
        ? options.columns()
        : options.columns || [];

    const vxeColumns = rawColumns.map((col: CrudColumn) => {
      const { viewComponent, viewComponentProps, vxeColumn, ...rest } = col;

      const result: any = { ...rest };

      // 框架内置对齐规则：未显式指定 align 时，状态列 / 时间列默认居中
      if (result.align === undefined && BUILTIN_CENTER_COLUMNS(col)) {
        result.align = 'center';
      }

      if (viewComponent) {
        result.cellRender = {
          name: viewComponent,
          props: viewComponentProps,
          // 同时透传到 attrs，兼容基于 attrs 读取配置的渲染器（如 CellDict / CellDictTag）
          attrs: viewComponentProps,
        };
      }

      if (vxeColumn) {
        Object.assign(result, vxeColumn);
      }

      return result;
    });

    if (tableActions.value?.length || dropDownActions.value?.length) {
      const actionCol = options.tableActionColumn || {};
      vxeColumns.push({
        field: '__ACTION__',
        title: $t('components.crud.table.action'),
        width: 220,
        align: 'center',
        showOverflow: 'tooltip',
        // 操作栏默认固定显示在右侧，可通过 tableActionColumn.fixed 显式覆盖（如 fixed: false）
        fixed: 'right',
        slots: {
          default: ({ row }: { row: any }) => (
            <TableAction
              actions={tableActions.value}
              dropDownActions={dropDownActions.value}
              record={row}
            />
          ),
        },
        ...actionCol,
        ...actionCol.vxeColumn,
      });
    }

    return vxeColumns;
  });
}
