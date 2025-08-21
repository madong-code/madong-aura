<template>
  <Dialog>
    <DetailForm v-if="viewType == 'view'" :model="record"> </DetailForm>
    <BasicForm v-else :model="formModel" />
  </Dialog>
</template>

<script setup lang="ts">
  import { useDetailForm, useForm } from '@/components/form'
  import { useDialog } from '@/components/dialog'
  import { ElMessage } from 'element-plus'
  import { CrudMethods, CrudSchema } from '@/components/crud'
  const props = defineProps<{
    crudSchema: CrudSchema
  }>()
  const record = ref<any>({})
  const updateFlag = ref(false)
  const formModel = reactive<any>({})
  const crudApi = ref<CrudMethods>()
  const viewType = ref('view')
  const [BasicForm, formApi] = useForm(props.crudSchema.formSchema || {})
  const [DetailForm] = useDetailForm(props.crudSchema.formSchema || {})
  const dialogTitle = computed(() => {
    return props.crudSchema.dialogTitle || '标题'
  })
  const [Dialog, dialogApi] = useDialog({
    title: dialogTitle.value,
    // dialogType: 'drawer',
    destroyOnClose: true,
    draggable: true,
    modal: true,
    onConfirm: () => {
      handleSubmit()
    }
  })

  const show = ({
    data,
    getCrudApi,
    type = 'view'
  }: {
    data: any
    getCrudApi: () => any
    type?: 'add' | 'edit' | 'view'
  }) => {
    viewType.value = type
    if (type === 'view') {
      dialogApi.setState({
        footer: false,
        closeOnClickModal: true
      })
    } else {
      dialogApi.setState({
        footer: true,
        closeOnClickModal: false
      })
    }
    updateFlag.value = type === 'edit'
    record.value = data || {}
    crudApi.value = getCrudApi()
    const detailApi = props.crudSchema.crudApi?.view
    const rowKey = props.crudSchema.rowKey || 'id'
    detailApi?.({
      [rowKey]: record.value[rowKey]
    }).then((res) => {
      record.value = res
    })
    dialogApi.open()
    let title = `${dialogTitle.value}详情`
    if (type === 'add') {
      title = `新增${dialogTitle.value}`
    } else if (type === 'edit') {
      title = `修改${dialogTitle.value}`
    }
    dialogApi.setState({
      title: title
    })
    if (type != 'view') {
      nextTick(() => {
        formApi.setValues(record.value)
      })
    }
  }

  const handleSubmit = () => {
    dialogApi.setState({ loading: true, confirmLoading: true })
    formApi
      .validate()
      .then(async () => {
        const values = await formApi.getValues()
        const submitApi = updateFlag.value
          ? props.crudSchema.crudApi?.edit
          : props.crudSchema.crudApi?.add
        submitApi?.(values).then(() => {
          ElMessage.success(
            updateFlag.value ? `修改${dialogTitle.value}成功` : `新增${dialogTitle.value}成功`
          )
          dialogApi.close()
          if (updateFlag.value) {
            crudApi.value?.refreshUpdate()
          } else {
            crudApi.value?.refreshCreate()
          }
          crudApi.value?.reload()
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
