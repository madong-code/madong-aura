import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { } from '@/api/dev/gateway'
import { dayjs } from 'element-plus'
import ProfileService from '@/api/system/profile'


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: ProfileService.onlineDevice,
    dialogTitle: $t("system.user.profile.online_device.table.title"),
    crudApi: {
    },
    // 使用crud
    useCrud: true,
    // 是否有新增
    hasAdd: false,
    // 是否有删除
    hasRemove: false,
    // 是否有修改
    hasEdit: false,
    // 是否有详情
    hasView: false,
    // 新增权限码
    addAuth: 'system:user_center:create',
    // 删除权限码
    removeAuth: 'system:user_center:delete',
    // 修改权限码
    editAuth: 'system:user_center:update',
    // 详情权限码
    viewAuth: 'system:user_center:read',
    // 表格列定义
    columns: [
      // {
      //   type: 'selection'
      // },

      {
        label: $t('system.user.profile.online_device.table.columns.user_name'),
        prop: 'user_name',
      },
      {
        label: $t('system.user.profile.online_device.table.columns.ip'),
        prop: 'ip',
      },
      {
        label: $t('system.user.profile.online_device.table.columns.ip_location'),
        prop: 'ip_location',
      },
      {
        label: $t('system.user.profile.online_device.table.columns.browser'),
        prop: 'browser'
      },
      {
        label: $t('system.user.profile.online_device.table.columns.os'),
        prop: 'os',
      },
      {
        label: $t('system.user.profile.online_device.table.columns.login_time'),
        prop: 'login_time',
        width: 170,
        formatter: ({ cellValue }) => {
          return dayjs(cellValue * 1000).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ],
    useSearchForm: false,
    // 搜索表单定义
    searchFormSchema: {

    }
  }
}
