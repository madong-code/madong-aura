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
              dialogRef: userFormRef,
              dialogParams: {
                isUpdate: false,
                getTableApi: () => tableApi
              }
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
  import { TableAction } from '@/components/table-action'
  import { UserService } from '@/api/sys/user'
  import { ElMessage } from 'element-plus'
  const userFormRef = ref()
  const userDetailRef = ref()
  const [BasicTable, tableApi] = useTable({
    ...tableSchema,
    columns: tableSchema.columns,
    // 表格行操作
    tableActions: [
      {
        label: '详情',
        type: 'primary',
        link: true,
        size: 'small',
        auth: 'sys:user:detail',
        dialogRef: userDetailRef
      },
      {
        label: '编辑',
        type: 'primary',
        link: true,
        size: 'small',
        auth: 'sys:user:update',
        dialogRef: userFormRef,
        dialogParams: {
          isUpdate: true,
          getTableApi: () => tableApi
        }
      }
    ],
    // 表格行操作-下拉菜单
    dropDownActions: [
      {
        label: '删除',
        type: 'danger',
        icon: '&#xe783;',
        size: 'small',
        auth: 'sys:user:remove',
        confirm: {
          title: '提示',
          content: '确定删除吗？',
          ok(record: any) {
            handleDelete(record)
          }
        }
      }
    ]
  })
  // 删除
  const handleDelete = (row: any) => {
    UserService.remove({
      ids: [row.id]
    }).then(() => {
      ElMessage.success('删除用户成功')
      tableApi.refreshRemove()
    })
  }
</script>
<style lang="scss" scoped></style>
