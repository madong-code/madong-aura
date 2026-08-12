<script lang="ts" setup>
import type { SubscribeRow } from '#/api/content/message/subscribe/types';

import { ElMessage, ElSwitch } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { SubscribeService } from '#/api/content/message/subscribe';
import { Page } from '#/components/page';

import { useCrudSchema } from './schemas';

const crudConfig = { ...useCrudSchema() };
const [BasicCrud, crudApi] = useCrud(crudConfig);

/** 切换单行订阅状态 → 保存 → 从后端重新加载 */
async function handleToggle(row: SubscribeRow) {
  const newSubscribed = !row.is_subscribed;
  try {
    await SubscribeService.batchSet([
      { definition_id: row.definition_id, is_subscribed: newSubscribed },
    ]);
    await crudApi.query();
  } catch (error) {
    console.error('切换订阅失败:', error);
    ElMessage.error('切换订阅失败');
  }
}
</script>

<template>
  <Page auto-content-height>
    <BasicCrud>
      <template #isSubscribedToggle="{ row }">
        <ElSwitch
          :model-value="row.is_subscribed"
          @change="handleToggle(row)"
        />
      </template>
    </BasicCrud>
  </Page>
</template>
