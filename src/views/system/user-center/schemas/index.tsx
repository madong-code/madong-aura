import type { CrudSchema } from '#/adapter/crud';

import { ProfileService } from '#/api/auth/profile';
import { $t } from '#/locales';
import { formatDate } from '#/utils';
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
    // 表格列定义
    columns: [
      // {
      //   type: 'selection'
      // },

      {
        label: $t('system.user.center.online_device.table.columns.user_name'),
        fieldName: 'user_name',
      },
      {
        label: $t('system.user.center.online_device.table.columns.ip'),
        fieldName: 'ip',
      },
      {
        label: $t('system.user.center.online_device.table.columns.ip_location'),
        fieldName: 'ip_location',
      },
      {
        label: $t('system.user.center.online_device.table.columns.browser'),
        fieldName: 'browser',
      },
      {
        label: $t('system.user.center.online_device.table.columns.os'),
        fieldName: 'os',
      },
      {
        label: $t('system.user.center.online_device.table.columns.login_time'),
        fieldName: 'login_time',
        minWidth: 170,
        formatter: (row: any) => {
          return formatDate(row.login_time);
        },
      },
    ],
  };
};
