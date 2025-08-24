<template>
  <Dialog>
    <el-tree
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
  const record = ref<any>({})
  const crudApi = ref<CrudMethods>()
  const treeData = ref<any>([])
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
    closeOnClickModal: true
  })
  defineExpose({
    show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      dialogApi.setState({
        title: `【${data.name}】授权菜单`
      })
      MenuService.tree({
        filterByUser: 1
      }).then((res) => {
        treeData.value = res
      })
      crudApi.value = getCrudApi()
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped></style>
