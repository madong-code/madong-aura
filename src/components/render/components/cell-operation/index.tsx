import { Icon } from '@iconify/vue';
/**
 * 单元格操作按钮渲染器
 */
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElPopconfirm,
} from 'element-plus';

// 判断是否为字符串
function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export const CellOperationRenderer = {
  renderTableDefault({ attrs, options, props }: any, { column, row }: any) {
    // 基础配置
    const defaultProps = {
      size: 'small',
      ...props,
    };

    let align: string;
    switch (column.align) {
      case 'center': {
        align = 'center';
        break;
      }
      case 'left': {
        align = 'flex-start';
        break;
      }
      default: {
        align = 'flex-end';
      }
    }

    // 预设配置（可扩展）
    const presets: Record<string, Record<string, any>> = {
      delete: {
        type: 'danger',
        text: '删除',
      },
    };

    // 动态解析
    const resolveDynamic = <T,>(
      val: ((row: any) => T) | T,
      defaultVal?: T,
    ): T | undefined => {
      try {
        return typeof val === 'function'
          ? ((val as (row: any) => T)(row) ?? defaultVal)
          : (val ?? defaultVal);
      } catch {
        return defaultVal;
      }
    };

    // 操作项处理
    const operations = (options || [])
      .map((opt: any) => {
        return isString(opt)
          ? {
              code: opt,
              ...presets[opt],
              ...defaultProps,
              text: presets[opt]?.text || opt,
            }
          : {
              ...defaultProps,
              ...presets[opt.code],
              ...opt,
            };
      })
      .map((opt: any) => {
        const dynamicOpt = {
          ...opt,
          disabled: resolveDynamic(opt.disabled, false),
        };
        Object.keys(dynamicOpt).forEach((key) => {
          if (typeof dynamicOpt[key] === 'function') {
            dynamicOpt[key] = resolveDynamic(dynamicOpt[key], []);
          }
        });
        return dynamicOpt;
      })
      .filter((opt: any) => {
        const showState = resolveDynamic(opt.show, true);
        return showState !== false;
      })
      .toSorted((a: any, b: any) => (b.priority || 0) - (a.priority || 0));

    // 渲染图标
    const renderIcon = (icon: string) => <Icon class="m-icon" icon={icon} />;

    // 渲染按钮
    const renderBtn = (opt: any, listen = true) => {
      const { icon: _icon, ...restOpt } = opt;
      return (
        <ElButton
          {...restOpt}
          onClick={
            listen ? () => attrs?.onClick?.({ code: opt.code, row }) : undefined
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: opt.icon ? '4px' : '0',
            whiteSpace: 'nowrap',
          }}
        >
          {opt.icon && renderIcon(opt.icon)}
          <span>{opt.text}</span>
        </ElButton>
      );
    };

    // 渲染删除确认
    const renderConfirm = (opt: any) => (
      <ElPopconfirm
        cancelButtonText="取消"
        confirmButtonText="确认"
        onConfirm={() => attrs?.onClick?.({ code: opt.code, row })}
        title={`确定删除 ${row[attrs?.nameField || 'name']} 吗？`}
      >
        {{
          reference: () => renderBtn(opt, false),
        }}
      </ElPopconfirm>
    );

    // 渲染更多菜单
    const renderMoreMenu = (items: any) => (
      <ElDropdown popperClass="operation-more-dropdown" trigger="hover">
        {{
          default: () => (
            <ElButton {...defaultProps} icon={renderIcon('ep:more')} />
          ),
          dropdown: () => (
            <ElDropdownMenu>
              {items.map((opt: any) => {
                const isDelete = opt.code === 'delete';
                return (
                  <ElDropdownItem disabled={opt.disabled} key={opt.code}>
                    {isDelete ? renderConfirm(opt) : renderBtn(opt)}
                  </ElDropdownItem>
                );
              })}
            </ElDropdownMenu>
          ),
        }}
      </ElDropdown>
    );

    // 布局控制
    const MAX_VISIBLE = attrs?.maxOperations || 2;
    const visibleOps = operations.slice(0, MAX_VISIBLE);
    const hiddenOps = operations.slice(MAX_VISIBLE);

    return (
      <div
        class="cell-operation-wrapper"
        style={{
          display: 'flex',
          justifyContent: align,
          gap: '4px',
          flexWrap: 'nowrap',
        }}
      >
        {visibleOps.map((opt: any) =>
          opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
        )}
        {hiddenOps.length > 0 && renderMoreMenu(hiddenOps)}
      </div>
    );
  },
};
