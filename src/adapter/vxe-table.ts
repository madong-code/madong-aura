import type { ComponentPropsMap, ComponentType } from './component';

import type { VxeTableGridOptions } from '#/core/plugins/vxe-table';

// 导入渲染器
import { cellRenderers } from '#/components/render';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '#/core/plugins/vxe-table';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'left',
        border: 'none' as any,
        stripe: true,
        columnConfig: {
          resizable: true,
        },
        height: 'auto',
        formConfig: {
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: 'items',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    // 注册所有渲染器
    Object.entries(cellRenderers).forEach(([name, renderer]) => {
      vxeUI.renderer.add(name, renderer);
    });
  },
  useVbenForm,
});

export const useVbenVxeGrid = <T extends Record<string, any>>(
  ...rest: Parameters<typeof useGrid<T, ComponentType, ComponentPropsMap>>
) => useGrid<T, ComponentType, ComponentPropsMap>(...rest);

export type * from '#/core/plugins/vxe-table';
