<script setup lang="ts">
import type { CrudApiInstance } from '#/components/crud/components/types';

import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';

import FileDetail from './detail.vue';
import { useCrudSchema } from './schemas';
import FileUpload from './upload.vue';

// schema 内的自定义动作需要在运行时取到 crudApi（刷新列表 / 清空勾选），
// 而 crudApi 由 useCrud 返回，故通过闭包延迟注入
let crudApiInstance: CrudApiInstance | undefined;

/** 文件详情抽屉 */
const detailVisible = ref(false);
const detailRow = ref<null | Record<string, any>>(null);

/** 上传弹窗 */
const uploadVisible = ref(false);

function openDetail(row: Record<string, any>) {
  detailRow.value = row;
  detailVisible.value = true;
}

function openUpload() {
  uploadVisible.value = true;
}

const [BasicCrud, crudApi] = useCrud(
  useCrudSchema(() => crudApiInstance, {
    onDetail: openDetail,
    onUpload: openUpload,
  }),
);
crudApiInstance = crudApi;
</script>
<template>
  <Page auto-content-height>
    <BasicCrud />
    <FileDetail v-model:visible="detailVisible" :row="detailRow" />
    <FileUpload v-model:visible="uploadVisible" @success="crudApi.refreshData()" />
  </Page>
</template>
