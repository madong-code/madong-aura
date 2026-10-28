import type { CrudSchema } from '#/adapter/crud';

import { ProfileService } from '#/api/auth/profile';
import { $t } from '#/locales';
import { formatDate } from '#/utils';

/** 空值统一占位，避免单元格空白无法区分「无数据」与「列未渲染」 */
const emptyText = (value: unknown) =>
  value === null || value === undefined || value === '' ? '-' : value;

// crud配置
export const useCrudSchema = (): CrudSchema => {
  return {
    // 接口地址
    crudApi: {
      list: ProfileService.getOnlineDevices,
    },
    rowKey: 'jti',
    // 使用crud
    // 是否有新增
    hasAdd: false,
    // 是否有删除
    hasRemove: false,
    // 是否有修改
    hasEdit: false,
    // 是否有详情
    hasView: false,
    // 表格列定义（vxe-table 使用 field / title / formatter，勿用 label / fieldName）
    // minWidth 之和需小于卡片内容区宽度（约 900px），否则操作列会被挤到横向滚动区外
    // 用函数形式导出：$t 延迟到表格渲染时求值，切换语言后表头才能实时更新
    columns: () => [
      {
        field: 'user_name',
        title: $t('system.user.center.online_device.table.columns.user_name'),
        minWidth: 100,
        formatter: ({ cellValue }: any) => emptyText(cellValue),
      },
      {
        field: 'ip',
        title: $t('system.user.center.online_device.table.columns.ip'),
        minWidth: 120,
        formatter: ({ cellValue }: any) => emptyText(cellValue),
      },
      {
        field: 'ip_location',
        title: $t('system.user.center.online_device.table.columns.ip_location'),
        minWidth: 110,
        formatter: ({ cellValue }: any) => emptyText(cellValue),
      },
      {
        field: 'browser',
        title: $t('system.user.center.online_device.table.columns.browser'),
        minWidth: 100,
        formatter: ({ cellValue }: any) => emptyText(cellValue),
      },
      {
        field: 'os',
        title: $t('system.user.center.online_device.table.columns.os'),
        minWidth: 90,
        formatter: ({ cellValue }: any) => emptyText(cellValue),
      },
      {
        field: 'login_time',
        title: $t('system.user.center.online_device.table.columns.login_time'),
        minWidth: 160,
        // 后端返回秒级时间戳，formatDate 内部已兼容 10 位数字
        formatter: ({ cellValue }: any) =>
          emptyText(formatDate(cellValue as number)),
      },
    ],
  };
};
