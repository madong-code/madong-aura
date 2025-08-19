<template>
  <Dialog>
    <DetailForm :model="record"> </DetailForm>
  </Dialog>
</template>

<script setup lang="ts">
  import { useDetailForm } from '@/components/form'
  import { useDialog } from '@/components/dialog'
  import { formSchema } from './schemas'
  import { UserService } from '@/api/sys/user'
  const record = ref<any>({})
  const [DetailForm] = useDetailForm(formSchema)
  const [Dialog, dialogApi] = useDialog({
    title: '用户详情',
    // dialogType: 'drawer',
    destroyOnClose: true,
    footer: false
  })
  const show = ({ data }: { data: any }) => {
    console.log('data', data)
    record.value = data || {}
    UserService.detail({
      id: record.value.id
    }).then((res) => {
      record.value = res
    })
    dialogApi.open()
  }

  defineExpose({
    show
  })
</script>

<style lang="scss" scoped></style>
