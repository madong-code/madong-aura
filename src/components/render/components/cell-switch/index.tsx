/**
 * 单元格开关渲染器
 */
import { ElSwitch } from 'element-plus';

export const CellSwitchRenderer = {
  renderTableDefault({ attrs, props }: any, { column, row }: any) {
    const loadingKey = `__loading_${column.field}`;

    // 动态解析禁用状态（支持函数/布尔值）
    const resolveDisabled = () => {
      if (typeof attrs?.disabled === 'function') {
        return attrs.disabled(row);
      }
      return attrs?.disabled ?? props?.disabled ?? false;
    };

    const finallyProps = {
      //   activeText: $t('common.enabled'),
      //   inactiveText: $t('common.disabled'),
      activeValue: 1,
      inactiveValue: 0,
      ...props,
      modelValue: row[column.field],
      loading: row[loadingKey] ?? false,
      disabled: resolveDisabled(),
    };

    return (
      <ElSwitch
        {...finallyProps}
        onChange={async (newVal: any) => {
          if (resolveDisabled()) return;
          row[loadingKey] = true;
          try {
            const result = await attrs?.beforeChange?.(newVal, row);
            if (result !== false) {
              row[column.field] = newVal;
            }
          } finally {
            row[loadingKey] = false;
          }
        }}
      />
    );
  },
};
