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
  columns: CrudColumn[];
  tableActionColumn?: Partial<CrudColumn>;
}

export function useColumns(
  options: UseColumnsOptions,
  tableActions: Ref<ActionItem[]>,
  dropDownActions: Ref<ActionItem[]>,
) {
  return computed(() => {
    const rawColumns = options.columns || [];

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
