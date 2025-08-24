<template>
  <Dialog>
    <BasicCrud />
  </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods, useCrud } from '@/components/crud'
  import { RbacService } from '@/api/sys/rbac'
  const record = ref<any>({})
  const crudApi = ref<CrudMethods>()
  const [Dialog, dialogApi] = useDialog({
    title: '添加用户',
    width: '70%'
  })
  const [BasicCrud] = useCrud({
    api: RbacService.userListExcludeRoleId,
    beforeFetch(params: any) {
      // 请求参数处理
      return {
        ...params,
        roleId: record.value.id
      }
    },
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
        type: 'selection'
      },
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
      crudApi.value = getCrudApi()
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped></style>
