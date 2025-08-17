<template>
  <Dialog>
    <DetailForm :model="record"> </DetailForm>
  </Dialog>
</template>

<script setup lang="ts">
  import { useDetailForm } from '@/components/form'
  import { useDialog } from '@/components/dialog'
  import { formSchema } from './schemas'
  const record = ref({})
  const [DetailForm] = useDetailForm(formSchema)
  const [Dialog, dialogApi] = useDialog({
    title: '用户详情',
    // dialogType: 'drawer',
    destroyOnClose: true,
    footer: false
  })
  const show = ({ data }: { data: any }) => {
    record.value = data || {}
    dialogApi.open()
  }

  defineExpose({
    show
  })
</script>

<style lang="scss" scoped></style>
