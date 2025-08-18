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
<script setup lang="tsx">
  import { useTable } from '@/components/table'
  import { tableSchema } from './schemas'
  import UserForm from './form.vue'
  import UserDetail from './detail.vue'
  import { ActionItem, TableAction } from '@/components/table-action'
  const userFormRef = ref()
  const userDetailRef = ref()
  const [BasicTable] = useTable({
    ...tableSchema,
    columns: [
      ...tableSchema.columns,
      {
        prop: '__ACTION__',
        label: '操作',
        width: 120,
        fixed: 'right', // 固定列
        formatter: (row: unknown) => {
          const actions: ActionItem[] = [
            {
              label: '详情',
              type: 'primary',
              link: true,
              size: 'small',
              auth: 'sys:user:detail',
              onClick: handleDetail.bind(null, row)
            },
            {
              label: '编辑',
              type: 'primary',
              link: true,
              size: 'small',
              auth: 'sys:user:update',
              onClick: handleEdit.bind(null, row)
            }
          ]
          const dropDownActions: ActionItem[] = [
            {
              label: '删除',
              type: 'danger',
              icon: '&#xe783;',
              size: 'small',
              auth: 'sys:user:remove',
              confirm: {
                title: '提示',
                content: '确定删除吗？',
                ok: handleDelete.bind(null, row)
              }
            }
          ]
          return <TableAction actions={actions} dropDownActions={dropDownActions} />
        }
      }
    ]
  })
  const handleAdd = () => {
    userFormRef.value.show({
      isUpdate: false
    })
  }
  const handleEdit = (row: any) => {
    userFormRef.value.show({
      data: row,
      isUpdate: true
    })
  }
  const handleDetail = (row: any) => {
    userDetailRef.value.show({
      data: row
    })
  }
  const handleDelete = (row: any) => {
    ElMessage.info(`删除用户 ${row.nickName}`)
  }
</script>
<style lang="scss" scoped></style>
