<script setup lang="ts">
import { ref } from "vue";

import CrontabLogIndex from "@/app/views/dev/crontab-log/index.vue";
import { CrudMethods } from "@/components/crud";
import { useDialog } from "@/components/dialog";

const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const [Dialog, dialogApi] = useDialog({
  title: "我是标题",
  width: "70%",
  dialogType: "drawer",
  fullscreen: false,
  footer: false,
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    crudApi.value = getCrudApi();
    dialogApi.setState({
      title: `【${data.title}】定时任务执行日志`,
    });
    dialogApi.open();
  },
});
</script>
<template>
  <Dialog>
    <CrontabLogIndex v-if="record.id" :crontab_id="record.id" />
  </Dialog>
</template>
<style lang="less" scoped></style>
