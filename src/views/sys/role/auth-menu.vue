<template>
  <Dialog>
    <el-tree
      ref="treeRef"
      node-key="id"
      style="max-width: 600px"
      :data="treeData"
      :props="defaultProps"
      show-checkbox
    />
  </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods } from '@/components/crud'
  import { MenuService } from '@/api/sys/menu'
  import { RbacService } from '@/api/sys/rbac'
  import { getTreeLeafNodeIds } from '@/utils/tool'
  const record = ref<any>({})
  const crudApi = ref<CrudMethods>()
  const treeData = ref<any>([])
  const treeRef = ref()
  const checkedKeys = ref<any>([])
  const leafNodeIds = ref<any>([])
  const defaultProps = ref({
    label: (data: any) => {
      return `${data.name} | ${data.code}`
    }
  })
  const [Dialog, dialogApi] = useDialog({
    title: '授权菜单',
    width: '50%',
    dialogType: 'drawer',
    modal: true,
    closeOnClickModal: true,
    onConfirm() {
      const checkedKeys = treeRef.value.getCheckedKeys()
      // 提交时，除了勾选节点外，半选节点也可提交，半选为非叶子节点
      const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
      const submitKeys = [...checkedKeys, ...halfCheckedKeys]
      dialogApi.setState({
        confirmLoading: true,
        loading: true
      })
      RbacService.saveRoleMenu(
        submitKeys.map((menuId) => {
          return {
            menuId,
            roleId: record.value.id
          }
        })
      )
        .then(() => {
          ElMessage.success('授权成功')
        })
        .finally(() => {
          dialogApi.setState({
            confirmLoading: false,
            loading: false
          })
        })
    }
  })
  defineExpose({
    show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      dialogApi.setState({
        title: `【${data.name}】授权菜单`
      })

      crudApi.value = getCrudApi()
      dialogApi.open()
      nextTick(() => {
        MenuService.tree({
          filterByUser: 1
        }).then((res) => {
          treeData.value = res
          leafNodeIds.value = getTreeLeafNodeIds(treeData.value)
          RbacService.roleMenuIds({
            roleId: data.id
          }).then((res: any) => {
            // 只能设置叶子节点，原因是当勾选父节点时，子节点也会被勾选
            checkedKeys.value = res.filter((id: any) => leafNodeIds.value.includes(id))
            treeRef.value.setCheckedKeys(checkedKeys.value)
          })
        })
      })
    }
  })
</script>
<style lang="scss" scoped></style>
