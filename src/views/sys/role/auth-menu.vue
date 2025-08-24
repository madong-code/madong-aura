<template>
  <Dialog> {{ record }} </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods } from '@/components/crud'
  const record = ref<any>({})
  const crudApi = ref<CrudMethods>()
  const [Dialog, dialogApi] = useDialog({
    title: '我是标题',
    width: '50%',
    dialogType: 'drawer'
  })
  defineExpose({
    show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      crudApi.value = getCrudApi()
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped></style>
