<script setup lang="ts">
import { ref } from "vue";

import TerminalForm from "./modules/terminal.vue";

const dialogVisible = ref(false);

/**
 * 关闭窗口回调
 * @param done
 */
const handleClose = (done: () => void) => {
  dialogVisible.value = false;
  //   ElMessageBox.confirm("Are you sure to close this dialog?")
  //     .then(() => {
  //       done();
  //     })
  //     .catch(() => {
  //       // catch error
  //     });
};

defineExpose({
  show() {
    dialogVisible.value = true;
  },
});
</script>
<template>
  <el-dialog
    v-model="dialogVisible"
    title="终端"
    width="50%"
    :before-close="handleClose"
    draggable
  >
    <TerminalForm />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false"> Confirm </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style lang="less" scoped></style>
