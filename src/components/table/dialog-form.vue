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
  import { TableMethods, TableSchema } from '@/components/table'
  const props = defineProps<{
    tableSchema: TableSchema
  }>()
  const record = ref<any>({})
  const updateFlag = ref(false)
  const formModel = reactive<any>({})
  const tableApi = ref<TableMethods>()
  const viewType = ref('view')
  const [BasicForm, formApi] = useForm(props.tableSchema.formSchema || {})
  const [DetailForm] = useDetailForm(props.tableSchema.formSchema || {})
  const dialogTitle = computed(() => {
    return props.tableSchema.dialogTitle || '标题'
  })
  const [Dialog, dialogApi] = useDialog({
    title: dialogTitle.value,
    // dialogType: 'drawer',
    destroyOnClose: true,
    modal: true,
    onConfirm: () => {
      handleSubmit()
    }
  })

  const show = ({
    data,
    getTableApi,
    type = 'view'
  }: {
    data: any
    getTableApi: () => any
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
    tableApi.value = getTableApi()
    const detailApi = props.tableSchema.crudApi?.view
    const rowKey = props.tableSchema.rowKey || 'id'
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
          ? props.tableSchema.crudApi?.edit
          : props.tableSchema.crudApi?.add
        submitApi?.(values).then(() => {
          ElMessage.success(
            updateFlag.value ? `修改${dialogTitle.value}成功` : `新增${dialogTitle.value}成功`
          )
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
