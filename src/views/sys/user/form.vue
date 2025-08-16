<template>
  <Dialog>
    <BasicForm :model="formModel">
      <!-- <template #realName="{ model }">
        <ElInput v-model="model.realName" placeholder="请输入姓名==" />
      </template> -->
    </BasicForm>
  </Dialog>
</template>

<script setup lang="ts">
  import { useForm } from '@/components/form'
  import { useDialog } from '@/components/dialog/use-dialog'
  import { formSchema } from './schemas'
  const record = ref({})
  const updateFlag = ref(false)
  const formModel = reactive<any>({})
  const [BasicForm, formApi] = useForm(formSchema)
  const [Dialog, dialogApi] = useDialog({
    title: '用户管理',
    // dialogType: 'drawer',
    onConfirm: () => {
      handleSubmit()
    }
  })
  const show = ({ data, isUpdate }: { data: any; isUpdate: boolean }) => {
    updateFlag.value = isUpdate === true
    record.value = data || {}
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
        console.log(values)
      })
      .finally(() => {
        dialogApi.setState({ loading: false, confirmLoading: false })
      })
  }

  defineExpose({
    show
  })
</script>

<style lang="scss" scoped>
  .el-dialog__header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-header-actions {
    display: flex;
    align-items: center;
  }

  .dialog-header-btn {
    margin-left: 10px;
    padding: 0;
    width: 24px;
    height: 24px;

    :deep(.el-icon) {
      font-size: 16px;
    }
  }

  :deep(.el-dialog__header) {
    display: block !important;
  }
</style>
