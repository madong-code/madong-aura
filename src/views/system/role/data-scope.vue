<template>
  <Dialog>
    <BasicForm>
      <template #scopes="slotProps">
        <el-tree
          class="mr-2"
          ref="treeRef"
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          :check-strictly="true"
          style="width: 100%"
        ></el-tree>
      </template>
    </BasicForm>
  </Dialog>
</template>
<script setup lang="tsx">
import { FormItemSchema, useForm } from "@/components/form";
import { useDialog } from "@/components/dialog";
import { CrudMethods } from "@/components/crud";
import { DictEnum } from "@/enums";
import { RoleService } from "@/api/system/role";
import { ref, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { $t } from "@/locales";
const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const treeData = ref<any>([]);
const checkedKeys = ref<any>([]);
const treeRef = ref();
const defaultProps = ref({
  label: (data: any) => {
    return `${data.name}`;
  },
});

const schema: FormItemSchema[] = [
  {
    prop: "code",
    label: $t("system.role.form.data_scope.role_code"),
    component: "Input",
    colSpan: 24,
    defaultValue: "",
    componentProps: {
      disabled: true,
    },
  },
  {
    prop: "name",
    label: $t("system.role.form.data_scope.role_name"),
    component: "Input",
    colSpan: 24,
    componentProps: {
      disabled: true,
    },
  },
  {
    prop: "data_scope",
    label: $t("system.role.form.data_scope.data_permission"),
    component: "ApiDict",
    colSpan: 24,
    componentProps: {
      code: DictEnum.SYS_DATA_PERMISSION,
    },
  },
  {
    prop: "scopes",
    label: $t("system.role.form.data_scope.dept_list"),
    component: "Input",
    colSpan: 24,
    ifShow(values) {
      return values.data_scope === 2; // 2 自定义数据权限
    },
  },
];

const [BasicForm, formApi] = useForm({
  labelPosition: "right",
  labelWidth: "100px",
  schema: schema,
});

const [Dialog, dialogApi] = useDialog({
  title: "分配权限",
  width: "500",
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  draggable: true,
  async onConfirm() {
    const values = await formApi.getValues();
    let submitKeys = [] as string[];
    if (values.data_scope == 2) {
      // 只提交选中的节点，不包括半选节点
      const checkedKeys = treeRef.value.getCheckedKeys();
      console.log("提交的选中节点:", checkedKeys);
      submitKeys = checkedKeys;
    }

    dialogApi.setState({
      confirmLoading: true,
      loading: true,
    });
    RoleService.dataScope(record?.value?.id, {
      ...values,
      scopes: submitKeys,
    })
      .then(() => {
        ElMessage.success($t("system.role.form.data_scope.assign_success"));
        dialogApi.close();
      })
      .finally(() => {
        dialogApi.setState({
          confirmLoading: false,
          loading: false,
        });
      });
  },
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    dialogApi.setState({
      title: `${$t("system.role.form.data_scope.assign_permission")}【${data.name}】`,
    });

    crudApi.value = getCrudApi();
    dialogApi.open();

    nextTick(async () => {
      try {
        const res = await RoleService.get(record.value.id);
        console.log("RoleService.get 返回数据:", res);
        // 检查 res.scopes 是否存在
        if (!res.scopes || !Array.isArray(res.scopes)) {
          console.error("res.scopes 不存在或不是数组:", res.scopes);
          formApi.setValues({ ...res, scopes: [] });
          return;
        }
        // 先获取部门树，以便判断哪些是叶子节点
        const deptTree = await RoleService.getScopeDeptTree();
        treeData.value = deptTree;
        console.log("部门树数据:", deptTree);
        // 收集所有节点的ID（不仅仅是叶子节点）
        const collectAllNodeIds = (nodes: any[]) => {
          const ids: any[] = [];
          const traverse = (nodeList: any[]) => {
            nodeList.forEach((node) => {
              ids.push(node.id);
              if (node.children && node.children.length > 0) {
                traverse(node.children);
              }
            });
          };
          traverse(nodes);
          return ids;
        };
        const allNodeIds = collectAllNodeIds(deptTree);
        console.log("所有节点ID:", allNodeIds);
        // 提取选中的ID，确保只包含部门树中存在的节点
        const selectedIds = res.scopes
          .map((item: any) => item.id)
          .filter((id: any) => allNodeIds.includes(id));
        console.log("选中的节点ID:", selectedIds);
        // 设置表单值
        formApi.setValues({ ...res, scopes: selectedIds });
        // 等待树组件初始化完成
        setTimeout(() => {
          if (treeRef.value) {
            // 设置选中状态
            checkedKeys.value = selectedIds;
            treeRef.value.setCheckedKeys(checkedKeys.value);
            console.log("已设置选中状态:", selectedIds);
          } else {
            console.error("treeRef.value 未初始化");
          }
        }, 200);
      } catch (error) {
        console.error("加载数据出错:", error);
      }
    });
  },
});
</script>
<style lang="scss" scoped>
.tree-toolbar {
  padding: 10px;
}
</style>
