<template>
  <Dialog>
    <BasicForm />
  </Dialog>
</template>

<script setup lang="ts">
  import { useDialog } from '@/components/dialog'
  import { useForm } from '@/components/form'
  const [BasicForm, formApi] = useForm({
    labelWidth: '100px',
    schema: [
      {
        label: '选择角色',
        prop: 'roleIdList',
        component: 'ApiSelect',
        componentProps: {
          api: '/sys/role/select',
          placeholder: '请选择角色',
          multiple: true
        }
      }
    ]
  })
  const record = ref({})
  const [Dialog, dialogApi] = useDialog({
    title: '授权角色',
    // dialogType: 'drawer',
    // direction: 'rtl', // 从右侧滑入
    width: '50%',
    onConfirm: async () => {
      formApi.validate().then(async () => {
        const values = await formApi.getValues()
        console.log(values)
        dialogApi.close()
      })
    }
  })
  defineExpose({
    show({ data }: { data: any }) {
      record.value = data
      dialogApi.open()
      nextTick(() => {
        formApi.setValues({
          roleIdList: data.roleIds?.split(',') || []
        })
      })
    }
  })
</script>
