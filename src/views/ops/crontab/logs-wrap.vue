<script setup lang="ts">
import { nextTick, ref } from 'vue';

import { ElDrawer } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';

import { useCrudSchema } from '../crontab-log/schemas';

const visible = ref(false);
const record = ref<any>(null);
// 当前查看的任务ID，beforeFetch 动态读取，保证只查询该任务的执行日志
const currentId = ref<number | string>('');

const schema = useCrudSchema();
// 覆盖 beforeFetch：注入当前任务ID，避免展示全部任务日志
schema.beforeFetch = (params: Record<string, any>) => {
  return {
    ...params,
    crontab_id: currentId.value,
  };
};

const [BasicCrud, crudApi] = useCrud(schema);

const show = (row: any) => {
  currentId.value = row.id;
  record.value = row;
  visible.value = true;
  // 若组件已挂载（重复打开不同任务），主动刷新数据
  nextTick(() => crudApi.query());
};

defineExpose({ show });
</script>
<template>
  <ElDrawer v-model="visible" title="任务日志" size="70%" destroy-on-close>
    <Page auto-content-height>
      <BasicCrud v-if="record?.id" />
    </Page>
  </ElDrawer>
</template>
