<template>
  <div class="sys-dict-item-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
const props = defineProps({
  dict_id: {
    type: [String, Number],
    default: undefined,
  },
  dict_code: {
    type: [String, Number],
    default: undefined,
  },
});

const [BasicCrud] = useCrud({
  ...crudSchema(),
  // 查询参数处理
  beforeFetch(params: any) {
    return {
      ...params,
      dict_id: props.dict_id,
    };
  },
  // 表单提交前处理
  transformFormValues(values: any) {
    return {
      ...values,
      dict_id: props.dict_id,
    };
  },
  toolbarActions: [],
  dropDownToolbarActions: [],
  tableActions: [],
  dropDownActions: [],
});
</script>
<style lang="scss" scoped></style>
