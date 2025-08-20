<template>
  <Dialog>
    <BasicForm :model="formModel" />
  </Dialog>
</template>

<script setup lang="ts">
  import { useForm } from '@/components/form'
  import { useDialog } from '@/components/dialog'
  import { formSchema } from './schemas'
  import { UserService } from '@/api/sys/user'
  import { ElMessage } from 'element-plus'
  import { TableMethods } from '@/components/table'
  const record = ref<any>({})
  const updateFlag = ref(false)
  const formModel = reactive<any>({})
  const tableApi = ref<TableMethods>()
  const [BasicForm, formApi] = useForm(formSchema)
  const [Dialog, dialogApi] = useDialog({
    title: '用户管理',
    // dialogType: 'drawer',
    destroyOnClose: true,
    onConfirm: () => {
      handleSubmit()
    }
  })
  const show = ({
    data,
    isUpdate,
    getTableApi
  }: {
    data: any
    isUpdate: boolean
    getTableApi: () => any
  }) => {
    updateFlag.value = isUpdate === true
    record.value = data || {}
    tableApi.value = getTableApi()
    UserService.detail({
      id: record.value.id
    }).then((res) => {
      record.value = res
    })
    dialogApi.open()
    dialogApi.setState({
      title: updateFlag.value ? '修改用户' : '新增用户'
    })
    nextTick(() => {
      formApi.setValues(record.value)
    })
  }

  const handleSubmit = () => {
    dialogApi.setState({ loading: true, confirmLoading: true })
    formApi
      .validate()
      .then(async () => {
        const values = await formApi.getValues()
        const submitApi = updateFlag.value ? UserService.update : UserService.save
        submitApi(values).then(() => {
          ElMessage.success(updateFlag.value ? '修改用户成功' : '新增用户成功')
          dialogApi.close()
          if (updateFlag.value) {
            tableApi.value?.refreshUpdate()
          } else {
            tableApi.value?.refreshCreate()
          }
          tableApi.value?.reload()
        })
      })
      .finally(() => {
        dialogApi.setState({ loading: false, confirmLoading: false })
      })
  }

  defineExpose({
    show
  })
</script>

<style lang="scss" scoped></style>
