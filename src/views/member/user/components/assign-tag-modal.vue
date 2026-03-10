<template>
  <Dialog>
    <div class="assign-tag-content art-full-height">
      <div class="pt-10">
        <BasicForm />
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
import { ref } from "vue";
import { useDialog } from "@/components/dialog";

import { $t } from "@/locales";
import { FormItemSchema, useForm } from "@/components/form";
import { MemberService } from "@/api/member";
import { CrudMethods } from "@/components/crud";

const record = ref();
const crudApi = ref<CrudMethods>();

const schema: FormItemSchema[] = [
  {
    prop: "id",
    label: $t("member.user.form.id"),
    component: "Input",
    colSpan: 24,
    show: false,
  },
  {
    prop: "tags",
    label: $t("member.user.form.tags"),
    component: "ApiSelect",
    colSpan: 24,
    componentProps: {
      class: "w-full mr-5",
      api: "/member/tag",
      params: {
        format: "select",
      },
      labelField: "label",
      valueField: "value",
      multiple: true,
    },
  },
];

const [BasicForm, formApi] = useForm({
  labelPosition: "right",
  labelWidth: "100px",
  schema: schema,
});

const [Dialog, dialogApi] = useDialog({
  title: $t("member.user.form.assign_tags"),
  width: "600px",
  draggable: true,
  fullscreen: false,
  modal: true,
  onConfirm: async () => {
    if (await formApi.validate()) {
      const values = (await formApi.getValues()) as any;
      await MemberService.assignTags(record.value.id, { tags: values.tags });
      ElMessage.success("分配标签成功");
      crudApi.value?.refreshUpdate();
      dialogApi.close();
    }
  },
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    dialogApi.setState({
      title: $t("member.user.form.assign_tags"),
    });
    crudApi.value = getCrudApi();
    const tags = data.tags.map((item: any) => item.id);
    dialogApi.open();
    nextTick(() => {
      formApi.setValues({
        id: data.id,
        tags: tags,
      });
      record.value = data;
    });
  },
});
</script>
<style lang="scss" scoped>
.assign-tag-content {
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}

.art-table-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
