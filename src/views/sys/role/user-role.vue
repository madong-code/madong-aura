<template>
  <Dialog> <BasicCrud /> </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods, useCrud } from '@/components/crud'
  import { RbacService } from '@/api/sys/rbac'
  const record = ref<any>({})
  const crudApi = ref<CrudMethods>()
  const [Dialog, dialogApi] = useDialog({
    title: '成员管理',
    width: '70%',
    dialogType: 'drawer',
    modal: true,
    closeOnClickModal: true,
    footer: false
  })
  const [BasicCrud] = useCrud({
    api: RbacService.userListByRoleId,
    useCrud: false,
    searchFormSchema: {
      schema: [
        {
          prop: 'm_LIKE_userName',
          label: '用户名',
          component: 'Input',
          componentProps: { placeholder: '请输入用户名' }
        },
        {
          prop: 'm_LIKE_realName',
          label: '姓名',
          component: 'Input',
          componentProps: { placeholder: '请输入姓名' }
        },
        {
          prop: 'm_LIKE_mobilePhone',
          label: '手机号码',
          component: 'Input',
          componentProps: { placeholder: '请输入手机号码' }
        }
      ]
    },
    columns: [
      {
        prop: 'userName',
        label: '用户名'
      },
      {
        prop: 'realName',
        label: '姓名'
      },
      {
        prop: 'mobilePhone',
        label: '手机号码'
      }
    ]
  })
  defineExpose({
    show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      dialogApi.setState({
        title: `【${data.name}】成员管理`
      })
      crudApi.value = getCrudApi()
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped></style>
