<template>
  <Dialog>
    <DetailForm :model="record"> </DetailForm>
  </Dialog>
</template>

<script setup lang="ts">
  import { useDetailForm } from '@/components/form/useDetailForm'
  import { useDialog } from '@/components/dialog/use-dialog'
  import { formSchema } from './schemas'
  const record = ref({})
  const [DetailForm] = useDetailForm(formSchema)
  const [Dialog, dialogApi] = useDialog({
    title: '用户详情',
    // dialogType: 'drawer',
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
