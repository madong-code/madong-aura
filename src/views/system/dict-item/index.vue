<template>
  <div class="sys-dict-item-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  const props = defineProps<{
    dictId?: string
  }>()
  const [BasicCrud] = useCrud({
    ...crudSchema,
    // 查询参数处理
    beforeFetch(params: any) {
      return {
        ...params,
        m_EQ_dictId: props.dictId
      }
    },
    // 表单提交前处理
    transformFormValues(values: any) {
      return {
        ...values,
        dictId: props.dictId
      }
    },
    toolbarActions: [],
    dropDownToolbarActions: [],
    tableActions: [],
    dropDownActions: []
  })
</script>
<style lang="scss" scoped></style>
