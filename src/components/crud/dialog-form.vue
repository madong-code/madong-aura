<template>
  <Dialog>
    <DetailForm v-if="viewType == 'view'" :model="record"> </DetailForm>
    <BasicForm v-else :model="formModel" />
  </Dialog>
</template>

<script setup lang="ts">
import { useDetailForm, useForm } from "@/components/form";
import { useDialog } from "@/components/dialog";
import { ElMessage } from "element-plus";
import { CrudMethods, CrudSchema } from "@/components/crud";
const props = defineProps<{
  crudSchema: CrudSchema;
}>();
const record = ref<any>({});
const updateFlag = ref(false);
const formModel = reactive<any>({});
const crudApi = ref<CrudMethods>();
const viewType = ref("view");
const [BasicForm, formApi] = useForm(props.crudSchema.formSchema || {});
const [DetailForm] = useDetailForm(props.crudSchema.formSchema || {});
const dialogTitle = computed(() => {
  return props.crudSchema.dialogTitle || "标题";
});

const [Dialog, dialogApi] = useDialog({
  title: dialogTitle.value,
  // dialogType: 'drawer',
  destroyOnClose: true,
  draggable: true,
  modal: true,
  onConfirm: () => {
    handleSubmit();
  },
});

const show = ({
  data,
  getCrudApi,
  type = "view",
}: {
  data: any;
  getCrudApi: () => any;
  type?: "add" | "edit" | "view";
}) => {
  viewType.value = type;
  if (type === "view") {
    dialogApi.setState({
      footer: false,
      closeOnClickModal: true,
    });
  } else {
    dialogApi.setState({
      footer: true,
      closeOnClickModal: false,
    });
  }
  updateFlag.value = type === "edit";
  record.value = data || {};
  crudApi.value = getCrudApi();
  dialogApi.open();
  if (type === "view" || type === "edit") {
    const detailApi = props.crudSchema.crudApi?.view;
    const rowKey = props.crudSchema.rowKey || "id";
    //调整使用ID获取详情
    detailApi?.(record.value[rowKey]).then((res) => {
      record.value = {
        ...record.value,
        ...res,
      };
      nextTick(() => {
        formApi.setValues(record.value);
      });
    });
  } else {
    nextTick(() => {
      formApi.setValues(record.value);
    });
  }
  const viewButtonText = props.crudSchema.viewButtonText || "详情";
  const editButtonText = props.crudSchema.editButtonText || "编辑";
  const addButtonText = props.crudSchema.addButtonText || "新增";
  let title = `${dialogTitle.value}${viewButtonText}`;
  if (type === "add") {
    title = `${addButtonText}${dialogTitle.value}`;
    // 这里处理一下树型结构
    if (props.crudSchema.tree) {
      const idKey = props.crudSchema.tree.id || "id";
      const pidKey = props.crudSchema.tree.pid || "parentId";
      record.value = {
        [pidKey]: record.value[idKey],
      };
    }
  } else if (type === "edit") {
    title = `${editButtonText}${dialogTitle.value}`;
  }
  dialogApi.setState({
    title: title,
  });
};

// const handleSubmit = () => {
//   dialogApi.setState({ loading: true, confirmLoading: true });
//   formApi
//     .validate()
//     .then(async () => {
//       const values = await formApi.getValues();
//       // 转换表单值
//       let submitValues = values;
//       if (props.crudSchema.transformFormValues) {
//         const type = updateFlag.value ? "edit" : "add";
//         submitValues = props.crudSchema.transformFormValues(values, type);
//       }
//       const submitApi = updateFlag.value
//         ? props.crudSchema.crudApi?.edit
//         : props.crudSchema.crudApi?.add;
//       submitApi?.(submitValues).then(() => {
//         const editButtonText = props.crudSchema.editButtonText || "编辑";
//         const addButtonText = props.crudSchema.addButtonText || "新增";
//         ElMessage.success(
//           updateFlag.value
//             ? `${editButtonText}${dialogTitle.value}成功`
//             : `${addButtonText}${dialogTitle.value}成功`
//         );
//         dialogApi.close();
//         if (updateFlag.value) {
//           crudApi.value?.refreshUpdate();
//         } else {
//           crudApi.value?.refreshCreate();
//         }
//       });
//     })
//     .finally(() => {
//       dialogApi.setState({ loading: false, confirmLoading: false });
//     });
// };

const handleSubmit = () => {
  dialogApi.setState({ loading: true, confirmLoading: true });
  formApi
    .validate()
    .then(async () => {
      const values = await formApi.getValues();
      // 转换表单值
      let submitValues = values;
      if (props.crudSchema.transformFormValues) {
        const type = updateFlag.value ? "edit" : "add";
        submitValues = props.crudSchema.transformFormValues(values, type);
      }

      // 根据操作类型选择不同的API调用方式
      if (updateFlag.value && props.crudSchema.crudApi?.edit) {
        // 更新操作：使用(id, params)格式
        // 从record.value中提取id，支持tree配置中的自定义id键名
        const idKey = props.crudSchema.tree?.id || props.crudSchema.rowKey || "id";
        const id = record.value[idKey];

        // 确保id存在
        if (id !== undefined) {
          props.crudSchema.crudApi
            .edit(id, submitValues)
            .then(() => {
              const editButtonText = props.crudSchema.editButtonText || "编辑";
              ElMessage.success(`${editButtonText}${dialogTitle.value}成功`);
              dialogApi.close();
              crudApi.value?.refreshUpdate();
            })
            .catch((error) => {
              console.error("更新失败:", error);
              ElMessage.error(`更新失败: ${error.message || "未知错误"}`);
            });
        } else {
          ElMessage.error("更新操作缺少ID");
          dialogApi.setState({ loading: false, confirmLoading: false });
        }
      } else if (!updateFlag.value && props.crudSchema.crudApi?.add) {
        // 新增操作：保持原有的调用方式
        props.crudSchema.crudApi
          .add(submitValues)
          .then(() => {
            const addButtonText = props.crudSchema.addButtonText || "新增";
            ElMessage.success(`${addButtonText}${dialogTitle.value}成功`);
            dialogApi.close();
            crudApi.value?.refreshCreate();
          })
          .catch((error) => {
            console.error("新增失败:", error);
            ElMessage.error(`新增失败: ${error.message || "未知错误"}`);
          });
      }
    })
    .catch((error) => {
      console.error("表单验证失败:", error);
    })
    .finally(() => {
      dialogApi.setState({ loading: false, confirmLoading: false });
    });
};

defineExpose({
  show,
});
</script>

<style lang="scss" scoped></style>
