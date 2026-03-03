<template>
  <Dialog>
    <div class="reset-password-content art-full-height">
      <div class="pt-10">
        <BasicForm />
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
import { useDialog } from "@/components/dialog";

import { $t } from "@/locales";
import { FormItemSchema, useForm } from "@/components/form";
import { MemberService } from "@/api/member";

const record = ref();

const schema: FormItemSchema[] = [
  {
    prop: "id",
    label: $t("member.user.form.id"),
    component: "Input",
    colSpan: 24,
    show: false,
  },
  {
    prop: "password",
    label: $t("member.user.form.password"),
    component: "Input",
    colSpan: 24,
    defaultValue: 123456,
    componentProps: {
      type: "password",
      class: "w-full mr-5",
      placeholder: $t("member.user.form.rules_password"),
      showPassword: true,
    },
    rules: [
      {
        required: true,
        message: $t("member.user.form.rules_password"),
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
  title: $t("tools.generator.code.import_table.title"),
  width: "600px",
  draggable: true,
  fullscreen: false,
  modal: true,
  onConfirm: async () => {
    if (await formApi.validate()) {
      const values = (await formApi.getValues()) as any;
      await MemberService.resetPassword(record.value.id, { password: values.password });
      ElMessage.success("重置密码成功");
      dialogApi.close();
    }
  },
});

defineExpose({
  show({ data }: { data: any }) {
    dialogApi.setState({
      title: $t("member.user.form.reset_password"),
    });
    record.value = data;
    dialogApi.open();
  },
});
</script>
<style lang="scss" scoped>
.reset-password-content {
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
