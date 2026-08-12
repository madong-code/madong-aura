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
    permissions: {
      view: 'system:user_center:read',
    },
    // 表格列定义
    // 注意：表格列用 title/field（vxe-table 字段），不要用 label/fieldName
    // （label/fieldName 是表单字段专用），否则表头会渲染为空。
    columns: [
      // {
      //   type: 'selection'
      // },

      {
        title: $t('system.user.center.online_device.table.columns.user_name'),
        field: 'user_name',
      },
      {
        title: $t('system.user.center.online_device.table.columns.ip'),
        field: 'ip',
      },
      {
        title: $t('system.user.center.online_device.table.columns.ip_location'),
        field: 'ip_location',
      },
      {
        title: $t('system.user.center.online_device.table.columns.browser'),
        field: 'browser',
      },
      {
        title: $t('system.user.center.online_device.table.columns.os'),
        field: 'os',
      },
      {
        title: $t('system.user.center.online_device.table.columns.login_time'),
        field: 'login_time',
        minWidth: 170,
        formatter: (row: any) => {
          return formatDate(row.login_time);
        },
      },
    ],
  };
};
