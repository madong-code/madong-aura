<template>
  <Dialog>
    <div class="tree-container">
      <div class="left-sidebar">
        <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
          <DeptTree v-model:value="deptIdList" @check="handleCheck" />
        </ElCard>
      </div>
      <div class="right-content art-full-height">
        <BasicCrud @reset="handleReset" />
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods, useCrud } from '@/components/crud'
  import { RbacService } from '@/api/sys/rbac'
  import DeptTree from '../user/dept-tree.vue'
  const record = ref<any>({})
  const deptIdList = ref<any>([])
  const parentCrudApi = ref<CrudMethods>()
  const [Dialog, dialogApi] = useDialog({
    title: '添加用户',
    width: '70%',
    modal: true,
    destroyOnClose: true,
    onConfirm: () => {
      const selection = crudApi.getRowSelection()
      if (selection.length === 0) {
        ElMessage.warning('请选择用户')
        return
      }
      dialogApi.setState({
        confirmLoading: true,
        loading: true
      })
      RbacService.saveUserRole(
        selection.map((item: any) => {
          return {
            roleId: record.value.id,
            userId: item.id
          }
        })
      )
        .then(() => {
          ElMessage.success('保存成功')
          // 当前可选列表查当于删除数据，所以使用删除刷新
          crudApi.refreshRemove()
          // 用户角色列表会新增数据，所以使用新增刷新
          parentCrudApi.value?.refreshCreate()
        })
        .finally(() => {
          dialogApi.setState({
            confirmLoading: false,
            loading: false
          })
        })
    }
  })
  const [BasicCrud, crudApi] = useCrud({
    api: RbacService.userListExcludeRoleId,
    beforeFetch(params: any) {
      // 请求参数处理
      return {
        ...params,
        roleId: record.value.id,
        m_IN_deptId: deptIdList.value
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
  const handleCheck = () => {
    crudApi.reload()
  }
  const handleReset = () => {
    deptIdList.value = []
  }
  defineExpose({
    show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      parentCrudApi.value = getCrudApi()
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped>
  .tree-container {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    // gap: 16px;
    .left-sidebar {
      flex-shrink: 0;
      width: 280px;
      height: 100%;
    }

    .right-content {
      flex-grow: 1;
      min-width: 0;
      height: 100%;
    }

    .art-table-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }

  @media screen and (max-width: $device-ipad) {
    .tree-container {
      display: block;
      gap: 0;
      height: auto;

      .left-sidebar {
        width: 100%;
        height: auto;
        margin-bottom: 20px;
      }
    }
  }
</style>
