<template>
  <div class="ask-question-page art-full-height">
    <BasicCrud />
    <Detail ref="detailRef" />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import Detail from "./detail.vue";

const detailRef = ref<any>(null);

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {
    return params;
  },
  tableActions: [
    {
      label: "详情",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:eye-outlined",
      auth: "ask:question:read",
      dialogRef: detailRef,
      dialogParams(record) {
        return {
          data: record,
        };
      },
    },
  ],
  dropDownActions: [
    {
      label: "置顶",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:eye-outlined",
      auth: "ask:question:stacky",
      onClick(e: Event, record: any) {},
    },
    {
      label: "精华",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:eye-outlined",
      auth: "ask:question:excellent",
      onClick(e: Event, record: any) {},
    },
  ],
});
</script>
