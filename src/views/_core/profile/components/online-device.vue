<script setup lang="ts">
import type { CrudSchema } from '#/adapter/crud';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { ProfileService } from '#/api/auth/profile';
import { $t } from '#/locales';
import { formatDate } from '#/utils';

interface RowType {
  ip: string;
  ip_location: string;
  browser: string;
  os: string;
  login_time: string;
  status: number;
  jti?: string;
  id?: string;
}

function handleKickout(row: RowType) {
  ElMessageBox.confirm(
    $t('system.profile.online_device.confirm_content', {
      device: row.browser || $t('system.profile.online_device.unknown_device'),
    }),
    $t('system.profile.online_device.confirm_title'),
    {
      confirmButtonText: $t('system.profile.online_device.confirm_ok'),
      cancelButtonText: $t('system.profile.online_device.confirm_cancel'),
      type: 'warning',
    },
  )
    .then(async () => {
      await ProfileService.kickoutSession(row.jti || (row.id as string));
      ElMessage.success($t('system.profile.online_device.success'));
      crudApi.reload();
    })
    .catch((error: any) => {
      if (error !== 'cancel') {
        ElMessage.error($t('system.profile.online_device.fail'));
      }
    });
}

const crudSchema: CrudSchema = {
  rowKey: 'jti',
  height: 400,
  stripe: true,
  border: false,
  crudApi: {
    list: async (params) => {
      const resp: any = await ProfileService.getOnlineDevices({
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      });
      const list = Array.isArray(resp)
        ? resp
        : (resp?.items ?? resp?.list ?? []);
      return {
        items: Array.isArray(list) ? list : [],
        total: resp?.total ?? list.length,
      };
    },
  },
  columns: [
    { field: 'jti', title: 'JTI', width: 250, align: 'left', visible: false },
    {
      field: 'ip',
      title: $t('system.profile.online_device.columns.ip'),
      minWidth: 130,
      align: 'center',
    },
    {
      field: 'ip_location',
      title: $t('system.profile.online_device.columns.ip_location'),
      minWidth: 120,
    },
    {
      field: 'browser',
      title: $t('system.profile.online_device.columns.browser'),
      formatter: ({ cellValue }: any) => cellValue || '-',
      visible: false,
    },
    {
      field: 'os',
      title: $t('system.profile.online_device.columns.os'),
      formatter: ({ cellValue }: any) => cellValue || '-',
      visible: false,
    },
    {
      field: 'login_time',
      title: $t('system.profile.online_device.columns.login_time'),
      width: 140,
      formatter: ({ cellValue }: any) =>
        formatDate((cellValue as number) * 1000),
    },
    {
      field: 'status',
      title: $t('system.profile.online_device.columns.status'),
      width: 80,
      align: 'center',
      cellRender: {
        name: 'CellTag',
        attrs: {
          options: [
            {
              value: 1,
              label: $t('system.profile.online_device.status_online'),
              color: 'success',
            },
            {
              value: 0,
              label: $t('system.profile.online_device.status_offline'),
              color: 'warning',
            },
          ],
        },
      },
    },
  ],
  toolbar: {
    refresh: true,
    custom: true,
    zoom: true,
  },
  searchForm: {
    enabled: false,
  },
  formDialog: {
    enabled: false,
  },
  tableActions: [
    {
      label: $t('system.profile.online_device.action_kickout'),
      link: true,
      onClick: (_e: any, record: any) => handleKickout(record as RowType),
    },
  ],
};

const [Crud, crudApi] = useCrud(crudSchema);
</script>

<template>
  <div>
    <Crud>
      <template #table-title>
        <div class="flex items-center gap-2 text-[1rem] font-bold">
          {{ $t('system.profile.online_device.title') }}
        </div>
      </template>
    </Crud>
  </div>
</template>
