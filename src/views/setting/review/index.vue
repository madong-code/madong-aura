<template>
  <div class="review-page art-full-height">
    <BasicCrud ref="crudRef" />

    <!-- 审核详情抽屉 -->
    <ReviewDetailDialog ref="detailDialogRef" />

    <!-- 批量审核对话框 -->
    <BatchAuditDialog ref="batchAuditDialogRef" />
  </div>
</template>

<script setup lang="tsx">
import { ref } from "vue";
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import { $t } from "@/locales";
import { ReviewDetailDialog, BatchAuditDialog } from "./components";

const detailDialogRef = ref<any>(null);
const batchAuditDialogRef = ref<any>(null);

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  // 行操作按钮
  dropDownActions: [],

  toolbarActions: [
    {
      label: $t("setting.review.actions.approve"),
      icon: "ant-design:check-outlined",
      auth: "setting:review:approve",
      type: "primary",
      ifShow: () => {
        const selectedRows = crudApi.getRowSelection();
        return selectedRows.length > 0;
      },
      onClick() {
        const selectedRows = crudApi.getRowSelection();
        batchAuditDialogRef.value.show({
          data: selectedRows,
          getCrudApi() {
            return crudApi;
          },
        });
      },
      // dialogParams() {
      //   const selectedRows = crudApi.getRowSelection();
      //   return {
      //     data: selectedRows.values,
      //     getCrudApi() {
      //       return crudApi;
      //     },
      //   };
      // },
    },
  ],

  tableActions: [
    {
      label: $t("setting.review.actions.view"),
      icon: "ant-design:eye-outlined",
      auth: "setting:review:read",
      type: "primary",
      link: true,
      dialogRef: detailDialogRef,
      dialogParams(record) {
        return {
          data: record,
          getCrudApi() {
            return crudApi;
          },
          type: "view",
        };
      },
    },
  ],
});
</script>

<style lang="scss" scoped>
.review-page {
  height: 100%;
}
</style>
