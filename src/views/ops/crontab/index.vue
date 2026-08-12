<script setup lang="ts">
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { CrontabService } from '#/api/ops';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import CrontabLogsWrap from './logs-wrap.vue';
import { useCrudSchema } from './schemas';

const crontabLogsWrapRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
  dropDownActions: [
    {
      label: '执行',
      type: 'primary',
      icon: 'ant-design:right-circle-outlined',
      ifShow: (_action: any, record: any) => {
        return record.enabled === 1;
      },
      sort: 1020,
      link: true,
      auth: 'crontab:task:execute',
      onClick: async (_e: Event, row: any) => {
        await CrontabService.execute(row.id);
        ElMessage.success($t('common.operation_success'));
        crudApi.refreshUpdate();
      },
    },
    {
      label: '启动',
      type: 'primary',
      sort: 1020,
      link: true,
      icon: 'ant-design:play-circle-outlined',
      auth: 'crontab:task:start',
      ifShow: (_action: any, record: any) => {
        return record.enabled === 0;
      },
      onClick: async (_e: Event, row: any) => {
        await CrontabService.start(row.id);
        ElMessage.success($t('common.operation_success'));
        crudApi.refreshUpdate();
      },
    },
    {
      label: '恢复',
      type: 'primary',
      sort: 1020,
      icon: 'ant-design:close-circle-outlined',
      link: true,
      ifShow: (_action: any, record: any) => {
        return record.enabled === 0;
      },
      auth: 'crontab:task:resume',
      onClick: async (_e: Event, row: any) => {
        await CrontabService.resume(row.id);
        ElMessage.success($t('common.operation_success'));
        crudApi.refreshUpdate();
      },
    },
    {
      label: '停止',
      type: 'primary',
      sort: 1020,
      icon: 'ant-design:pause-circle-outlined',
      link: true,
      ifShow: (_action: any, record: any) => {
        return record.enabled === 1;
      },
      auth: 'crontab:task:pause',
      onClick: async (_e: Event, row: any) => {
        await CrontabService.pause(row.id);
        ElMessage.success($t('common.operation_success'));
        crudApi.refreshUpdate();
      },
    },
    {
      label: '日志',
      type: 'primary',
      sort: 1020,
      icon: 'ant-design:info-circle-outlined',
      link: true,
      auth: 'crontab:task:logs',
      onClick: (_e: Event, row: any) => {
        crontabLogsWrapRef.value.show(row);
      },
    },
  ],
});
</script>
<template>
  <Page auto-content-height>
    <BasicCrud />
    <CrontabLogsWrap ref="crontabLogsWrapRef" />
  </Page>
</template>
