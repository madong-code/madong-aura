<template>
  <Dialog>
    <div class="p-4">
      <BasicForm class="padding-20" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useDialog } from "@/components/dialog";
import { ReviewService } from "@/api/setting/review";
import { useForm } from "@/components/form";
import { $t } from "@/locales";
import { CrudMethods } from "@/components/crud";

const selectedRows = ref<any[]>([]);
const crudApi = ref<any>();

const [BasicForm, formApi] = useForm({
  labelPosition: "left",
  labelWidth: "100px",
  schema: [
    {
      prop: "action",
      label: $t("setting.review.batch_audit.action"),
      component: "RadioGroup",
      defaultValue: "approve",
      componentProps: {
        renderType: "RadioGroup",
        options: [
          { label: $t("setting.review.batch_audit.approve"), value: "approve" },
          { label: $t("setting.review.batch_audit.reject"), value: "reject" },
        ],
        isBtn: true,
      },
      rules: [{ required: true, message: $t("setting.review.batch_audit.placeholder.action"), trigger: "change" }],
    },
    {
      prop: "reason",
      label: $t("setting.review.batch_audit.reason"),
      component: "Input",
      componentProps: {
        type: "textarea",
        rows: 4,
        placeholder: $t("setting.review.batch_audit.placeholder.reason"),
        clearable: true,
      },
      rules: [{ required: true, message: $t("setting.review.batch_audit.placeholder.reason"), trigger: "blur" }],
    },
  ],
});

const [Dialog, dialogApi] = useDialog({
  title: $t("setting.review.batch_audit.title"),
  width: "500px",
  dialogType: "dialog",
  footer: true,
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  fullscreen: false,
  async onConfirm() {
    formApi.validate().then(async () => {
      const values = await formApi.getValues();
      // 过滤掉已审核的记录（status !== 0 的记录）
      const pendingRows = selectedRows.value.filter((item) => item.status === 0);

      if (pendingRows.length === 0) {
        ElMessage.warning($t("setting.review.batch_audit.message.warning"));
        return;
      }

      if (values.action === "approve") {
        await ReviewService.batchApprove(
          pendingRows.map((item) => item.id),
          values.reason
        );
      } else {
        await ReviewService.batchReject(
          pendingRows.map((item) => item.id),
          values.reason
        );
      }
      if (crudApi.value) {
        crudApi.value.refreshUpdate();
      }
      ElMessage.success($t("setting.review.batch_audit.message.success"));
      dialogApi.close();
    });
  },
});

const show = ({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) => {
  selectedRows.value = data || [];
  crudApi.value = getCrudApi?.();
  dialogApi.open();
};

defineExpose({ show });
</script>
