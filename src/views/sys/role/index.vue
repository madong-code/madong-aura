<template>
  <div class="user-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  const [BasicCrud, crudApi] = useCrud({
    ...crudSchema,
    // 是否有修改
    hasEdit: false,
    // hasAdd: true,
    // 左侧工具栏
    toolbarActions: [],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [],
    // 表格行操作-下拉菜单
    dropDownActions: [
      {
        label: crudSchema.editButtonText || '编辑',
        type: 'primary',
        sort: 10,
        link: true,
        icon: 'ant-design:edit-outlined',
        auth: crudSchema.editAuth,
        onClick() {
          crudApi.openEditDialog()
        }
      }
    ]
  })
</script>
<style lang="scss" scoped></style>
