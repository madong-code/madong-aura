<template>
  <div class="user-page art-full-height">
    <BasicCrud />
    <GrantRole ref="grantRoleRef" />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  import GrantRole from './grant-role.vue'
  const grantRoleRef = ref()
  const [BasicCrud, crudApi] = useCrud({
    ...crudSchema,
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
        label: '授权角色',
        icon: 'ant-design:team-outlined',
        type: 'primary',
        link: true,
        dialogRef: grantRoleRef,
        dialogParams() {
          return {
            getCrudApi: () => crudApi
          }
        }
      }
    ]
  })
</script>
<style lang="scss" scoped></style>
