<template>
  <Dialog> <DictItemIndex :dict-id="record.id" /> </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods } from '@/components/crud'
  import DictItemIndex from '../dict-item/index.vue'
  const record = ref<any>({})
  const crudApi = ref<CrudMethods>()
  const [Dialog, dialogApi] = useDialog({
    title: '我是标题',
    width: '50%',
    dialogType: 'drawer',
    footer: false,
    modal: true,
    closeOnClickModal: true,
    destroyOnClose: true
  })
  defineExpose({
    show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      crudApi.value = getCrudApi()
      dialogApi.setState({
        title: `【${data.name}】字典项管理`
      })
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped></style>
