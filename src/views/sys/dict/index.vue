<template>
  <div class="sys-dict-page art-full-height">
    <BasicCrud />
    <DictItemWrap ref="dictItemWrapRef" />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  import DictItemWrap from './dict-item-wrap.vue'
  const dictItemWrapRef = ref()
  const [BasicCrud, crudApi] = useCrud({
    ...crudSchema,
    hasEdit: false,
    // 左侧工具栏
    toolbarActions: [],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [
      {
        label: '字典项',
        icon: 'ant-design:setting-outlined',
        type: 'primary',
        link: true,
        dialogRef: dictItemWrapRef,
        dialogParams() {
          return {
            getCrudApi() {
              return crudApi
            }
          }
        }
      }
    ],
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
