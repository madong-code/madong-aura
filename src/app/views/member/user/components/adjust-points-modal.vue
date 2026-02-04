<template>
  <Dialog>
    <div class="adjust-points-content art-full-height">
      <div class="pt-10">
        <BasicForm />
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
import { ref, nextTick } from "vue";
import { useDialog } from "@/components/dialog";

import { $t } from "@/locales";
import { FormItemSchema, useForm } from "@/components/form";
import { MemberService } from "@/app/api/member";
import { t } from "@wangeditor/editor";
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
    prop: "points",
    label: $t("member.user.form.points"),
    component: "Input",
    colSpan: 24,
    componentProps: {
      type: "number",
      class: "w-full mr-5",
      min: 0,
      precision: 0,
    },
    rules: [
      {
        required: true,
        message: $t("member.user.form.rules_points"),
        trigger: "blur",
      },
    ],
  },
];

const [BasicForm, formApi] = useForm({
  labelPosition: "right",
  labelWidth: "100px",
  schema: schema,
});

const [Dialog, dialogApi] = useDialog({
  title: $t("member.user.form.adjust_points"),
  width: "400px",
  draggable: true,
  fullscreen: false,
  modal: true,
  onConfirm: async () => {
    if (await formApi.validate()) {
      const values = (await formApi.getValues()) as any;
      await MemberService.adjustPoints(record.value.id, { points: values.points });
      ElMessage.success("调整积分成功");
      crudApi.value?.refreshUpdate();
      dialogApi.close();
    }
  },
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    dialogApi.setState({
      title: $t("member.user.form.adjust_points"),
    });
    crudApi.value = getCrudApi();
    dialogApi.open();
    nextTick(() => {
      formApi.setValues({
        id: data.id,
        points: data.points || 0,
      });
      record.value = data;
    });
  },
});
</script>
<style lang="scss" scoped>
.adjust-points-content {
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
