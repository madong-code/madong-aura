import type { VxeGridProps as VxeTableGridProps } from 'vxe-table';

import type { ViewedRowOptions } from './types';

import { isRef, shallowRef, triggerRef, watch } from 'vue';

import { isBoolean, isFunction } from '#/core/shared';

const DEFAULT_VIEWED_CLASS = 'vxe-row--viewed';

/**
 * 已读行 helper
 *
 * 垫片说明：契约与 madong-single 保持一致（mark/isViewed/clear/remove、
 * rowClassName/rowStyle 注入、CellOperation 列拦截）。持久化策略仅保留
 * 内存模式；persist 配置可传入但不会落盘，业务当前未使用该能力。
 */
export function useViewedRow<T = any>(
  options: ViewedRowOptions<T> & { keyField: string },
) {
  const maxSize = 100;

  const viewedSet = shallowRef<Set<number | string>>(new Set());

  function enforceMaxSize(set: Set<number | string>) {
    if (maxSize > 0 && set.size > maxSize) {
      const iterator = set.values();
      while (set.size > maxSize) {
        const oldest = iterator.next().value;
        if (oldest !== undefined) {
          set.delete(oldest);
        }
      }
    }
  }

  function updateViewedSet(updater: (set: Set<number | string>) => boolean) {
    const changed = updater(viewedSet.value);

    if (changed) {
      enforceMaxSize(viewedSet.value);
      triggerRef(viewedSet);
    }
  }

  if (options.viewedKeys) {
    const keys = isRef(options.viewedKeys)
      ? options.viewedKeys.value
      : options.viewedKeys;
    updateViewedSet((set) => {
      let changed = false;
      for (const key of keys) {
        if (!set.has(key)) {
          set.add(key);
          changed = true;
        }
      }
      return changed;
    });
  }

  if (isRef(options.viewedKeys)) {
    watch(options.viewedKeys, (newKeys) => {
      updateViewedSet((set) => {
        let changed = false;
        for (const key of newKeys) {
          if (!set.has(key)) {
            set.add(key);
            changed = true;
          }
        }
        return changed;
      });
    });
  }

  function markAsViewed(record: T) {
    const key = (record as Record<string, any>)[options.keyField] as
      | number
      | string;
    if (key === null || key === undefined) return;

    updateViewedSet((set) => {
      if (set.has(key)) return false;
      set.add(key);
      return true;
    });
  }

  function markKeysAsViewed(keys: Array<number | string>) {
    updateViewedSet((set) => {
      let changed = false;
      for (const key of keys) {
        if (!set.has(key)) {
          set.add(key);
          changed = true;
        }
      }
      return changed;
    });
  }

  function isViewed(record: T): boolean {
    const key = (record as Record<string, any>)[options.keyField] as
      | number
      | string;
    return viewedSet.value.has(key);
  }

  function clearViewed() {
    const hadData = viewedSet.value.size > 0;
    viewedSet.value.clear();

    if (hadData) {
      triggerRef(viewedSet);
    }
  }

  function removeKeys(keys: Array<number | string>) {
    updateViewedSet((set) => {
      let changed = false;
      for (const key of keys) {
        if (set.has(key)) {
          set.delete(key);
          changed = true;
        }
      }
      return changed;
    });
  }

  function getRowClassName(params: any): string {
    if (!isViewed(params.row)) return '';

    const { rowClassName } = options;
    if (rowClassName === undefined || rowClassName === null) {
      return DEFAULT_VIEWED_CLASS;
    }
    if (typeof rowClassName === 'string') {
      return rowClassName;
    }
    if (isFunction(rowClassName)) {
      return normalizeClassName(rowClassName(params));
    }
    return DEFAULT_VIEWED_CLASS;
  }

  function getRowStyle(params: any): any {
    if (!isViewed(params.row)) return undefined;

    const { rowStyle } = options;
    if (rowStyle === undefined || rowStyle === null) {
      return undefined;
    }
    if (isFunction(rowStyle)) {
      return rowStyle(params);
    }
    return rowStyle;
  }

  return {
    clearViewed,
    getRowClassName,
    getRowStyle,
    isViewed,
    markAsViewed,
    markKeysAsViewed,
    removeKeys,
    viewedSet,
  };
}

export type ViewedRowHelper<T = any> = ReturnType<typeof useViewedRow<T>>;

// ========== 工具函数 ==========

function normalizeClassName(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(' ');
  }
  return '';
}

function mergeClassNames(...classNames: any[]): string {
  return classNames
    .map((c) => normalizeClassName(c))
    .filter(Boolean)
    .join(' ');
}

/**
 * 包装 columns，拦截 CellOperation 的 onClick，根据 actionCodes 自动标记已读
 * 注意：columns 每次都是 cloneDeep 后的新对象，不存在重复包装问题
 */
function wrapColumnsForViewedRow(
  columns: any[],
  actionCodes: string[],
  markAsViewed: (record: any) => void,
): any[] {
  return columns.map((column) => {
    if (!column || typeof column !== 'object') return column;

    const nextColumn = { ...column };

    if (nextColumn.cellRender?.name === 'CellOperation') {
      const cellRender = { ...nextColumn.cellRender };
      const attrs = { ...cellRender.attrs };
      const originalOnClick = attrs.onClick;

      attrs.onClick = (params: { code: string; row: any }) => {
        originalOnClick?.(params);
        if (actionCodes.includes(params.code)) {
          markAsViewed(params.row);
        }
      };

      cellRender.attrs = attrs;
      nextColumn.cellRender = cellRender;
    }

    if (Array.isArray(nextColumn.children)) {
      nextColumn.children = wrapColumnsForViewedRow(
        nextColumn.children,
        actionCodes,
        markAsViewed,
      );
    }

    return nextColumn;
  });
}

/**
 * 将 viewedRow 配置应用到 mergedOptions 上
 * 注入 rowClassName、rowStyle、columns 拦截
 */
export function applyViewedRowOptions(
  mergedOptions: VxeTableGridProps,
  viewedRowConfig: boolean | ViewedRowOptions,
  helper: ReturnType<typeof useViewedRow>,
) {
  // 从最新的配置中读取 rowClassName 和 rowStyle（支持运行时修改）
  const viewedRowClassName = isBoolean(viewedRowConfig)
    ? undefined
    : viewedRowConfig.rowClassName;
  const viewedRowStyle = isBoolean(viewedRowConfig)
    ? undefined
    : viewedRowConfig.rowStyle;

  // 注入 rowClassName
  const originalRowClassName = mergedOptions.rowClassName;
  mergedOptions.rowClassName = (params: any) => {
    if (!helper.isViewed(params.row)) {
      return normalizeClassName(
        isFunction(originalRowClassName)
          ? originalRowClassName(params)
          : originalRowClassName,
      );
    }

    let viewedClass: string;
    if (viewedRowClassName === undefined || viewedRowClassName === null) {
      viewedClass = DEFAULT_VIEWED_CLASS;
    } else if (typeof viewedRowClassName === 'string') {
      viewedClass = viewedRowClassName;
    } else if (isFunction(viewedRowClassName)) {
      viewedClass = normalizeClassName(viewedRowClassName(params));
    } else {
      viewedClass = DEFAULT_VIEWED_CLASS;
    }

    return mergeClassNames(
      isFunction(originalRowClassName)
        ? originalRowClassName(params)
        : originalRowClassName,
      viewedClass,
    );
  };

  // 注入 rowStyle
  const originalRowStyle = mergedOptions.rowStyle;
  mergedOptions.rowStyle = (params: any) => {
    const originalStyle = isFunction(originalRowStyle)
      ? originalRowStyle(params)
      : originalRowStyle;

    if (!helper.isViewed(params.row)) {
      return originalStyle || undefined;
    }

    let viewedStyle: any;
    if (viewedRowStyle === undefined || viewedRowStyle === null) {
      viewedStyle = undefined;
    } else if (isFunction(viewedRowStyle)) {
      viewedStyle = viewedRowStyle(params);
    } else {
      viewedStyle = viewedRowStyle;
    }

    if (!viewedStyle && !originalStyle) return undefined;
    if (!originalStyle) return viewedStyle;
    if (!viewedStyle) return originalStyle;
    return { ...originalStyle, ...viewedStyle };
  };

  // 拦截 CellOperation columns
  const actionCodes =
    !isBoolean(viewedRowConfig) && viewedRowConfig.actionCodes
      ? Array.isArray(viewedRowConfig.actionCodes)
        ? viewedRowConfig.actionCodes
        : [viewedRowConfig.actionCodes]
      : [];

  if (actionCodes.length > 0 && Array.isArray(mergedOptions.columns)) {
    mergedOptions.columns = wrapColumnsForViewedRow(
      mergedOptions.columns,
      actionCodes,
      helper.markAsViewed,
    );
  }
}
