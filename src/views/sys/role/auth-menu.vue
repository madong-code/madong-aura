<template>
  <Dialog> {{ record }} </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods } from '@/components/crud'
  const record = ref<any>({})
  const crudApi = ref<CrudMethods>()
  const [Dialog, dialogApi] = useDialog({
    title: '授权菜单',
    width: '50%',
    dialogType: 'drawer',
    modal: true,
    closeOnClickModal: true
  })
  defineExpose({
    show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      dialogApi.setState({
        title: `【${data.name}】授权菜单`
      })
      crudApi.value = getCrudApi()
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped></style>
