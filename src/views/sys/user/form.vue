<template>
  <ElDialog
    :destroy-on-close="true"
    v-model="dialogVisible"
    :title="updateFlag ? '编辑用户' : '新增用户'"
  >
    <pre>
      <code>{{ JSON.stringify(record, null, 2) }}</code>
     </pre>
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
