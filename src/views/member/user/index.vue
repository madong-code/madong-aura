<template>
  <div class="member-list-page art-full-height">
    <BasicCrud />
    <ResetPasswordModal ref="resetPasswordModalRef" />
    <AssignTagModal ref="assignTagModalRef" />
    <AdjustPointsModal ref="adjustPointsModalRef" />
  </div>
</template>

<script setup lang="tsx">
import { ref } from "vue";
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import ResetPasswordModal from "./components/reset-password-modal.vue";
import AssignTagModal from "./components/assign-tag-modal.vue";
import AdjustPointsModal from "./components/adjust-points-modal.vue";

const resetPasswordModalRef = ref();
const assignTagModalRef = ref();
const adjustPointsModalRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  dropDownActions: [
    {
      label: "重置密码",
      type: "primary",
      icon: "ant-design:right-circle-outlined",
      sort: 1020,
      link: true,
      auth: "member:user:reset_password",
      dialogRef: resetPasswordModalRef,
    },
    {
      label: "设置标签",
      type: "primary",
      sort: 1020,
      link: true,
      icon: "ant-design:play-circle-outlined",
      auth: "member:user:tag",
      dialogRef: assignTagModalRef,
      dialogParams() {
        return {
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
    {
      label: "调整积分",
      type: "primary",
      sort: 1020,
      icon: "ant-design:close-circle-outlined",
      link: true,
      auth: "member:user:points",
      dialogRef: adjustPointsModalRef,
      dialogParams() {
        return {
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
  ],
});
</script>
