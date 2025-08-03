<template>
  <ElDialog
    custom-class="m-dialog"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    v-model="dialogVisible"
    width="60%"
    :title="updateFlag ? '编辑用户' : '新增用户'"
  >
    <pre>
      <code>{{ JSON.stringify(record, null, 2) }}</code>
     </pre>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="dialogVisible = false">确定</ElButton>
    </template>
  </ElDialog>
</template>
<script setup lang="ts">
  const dialogVisible = ref(false)
  const record = ref({})
  const updateFlag = ref(false)
  const show = ({ data, isUpdate }: { data: any; isUpdate: boolean }) => {
    updateFlag.value = isUpdate === true
    record.value = data || {}
    dialogVisible.value = true
  }
  defineExpose({
    show
  })
</script>
<style lang="scss" scoped></style>
