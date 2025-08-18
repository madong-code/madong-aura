<template>
  <div class="user-page art-full-height">
    <BasicTable>
      <template #toolbar-actions>
        <TableAction
          :actions="[
            {
              label: '新增',
              type: 'primary',
              icon: '&#xe83e;',
              auth: 'sys:user:save',
              onClick: handleAdd.bind(null)
            }
          ]"
        />
      </template>
    </BasicTable>
    <UserForm ref="userFormRef" />
    <UserDetail ref="userDetailRef" />
  </div>
</template>
<script setup lang="ts">
  import { useTable } from '@/components/table'
  import { tableSchema } from './schemas'
  import UserForm from './form.vue'
  import UserDetail from './detail.vue'
  const userFormRef = ref()
  const userDetailRef = ref()
  const [BasicTable] = useTable({
    ...tableSchema
  })
  const handleAdd = () => {
    userFormRef.value.show({
      isUpdate: false
    })
  }
  // const handleEdit = (row: any) => {
  //   userFormRef.value.show({
  //     data: row,
  //     isUpdate: true
  //   })
  // }
  // const handleDetail = (row: any) => {
  //   userDetailRef.value.show({
  //     data: row
  //   })
  // }
  // const handleDelete = (row: any) => {
  //   ElMessage.info(`删除用户 ${row.nickName}`)
  // }
</script>
<style lang="scss" scoped></style>
