<template>
  <Dialog>
    <div class="initerface-content art-full-height">
      <BasicCrud />
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
import { CrudMethods } from "@/components/crud";
import { useDialog } from "@/components/dialog";

const record = ref<any>({});
const crudApi = ref<CrudMethods>();

const [Dialog, dialogApi] = useDialog({
  title: "选择权限",
  width: "60%",
  modal: true,
  draggable: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  onConfirm() {},
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    dialogApi.setState({
      title: `选择接口`,
    });

    crudApi.value = getCrudApi();
    dialogApi.open();
    nextTick(() => {
      // AuthService.getUserMenus().then((res) => {
      //   treeData.value = res;
      //   leafNodeIds.value = getTreeLeafNodeIds(treeData.value);
      //   AuthService.roleMenuIds({
      //     role_id: data.id,
      //   }).then((res: any) => {
      //     // 只能设置叶子节点，原因是当勾选父节点时，子节点也会被勾选
      //     checkedKeys.value = res.filter((id: any) => leafNodeIds.value.includes(id));
      //     treeRef.value.setCheckedKeys(checkedKeys.value);
      //   });
      // });
    });
  },
});
</script>
