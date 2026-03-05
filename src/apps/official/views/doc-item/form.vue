<template>
  <Dialog>
    <BasicForm />
  </Dialog>
</template>
<script setup lang="tsx">
import { FormItemSchema, useForm } from "@/components/form";
import { useDialog } from "@/components/dialog";
import { CrudMethods, CrudSchema } from "@/components/crud";
import { DictEnum } from "@/apps/official/enums/dict-enum";
import { RoleService } from "@/api/system/role";
import { ref, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { $t } from "@/locales";
import { DocContentService } from "../../api/doc/content";
const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const formType = ref("add");

const schema: FormItemSchema[] = [
  {
    label: "ID",
    prop: "id",
    component: "Input",
    colSpan: 24,
    show: false,
    ifDetail: false,
  },
  {
    label: "ID",
    prop: "project_id",
    component: "Input",
    colSpan: 24,
    show: false,
    ifDetail: false,
  },
  {
    label: "类型",
    prop: "type",
    component: "RadioGroup",
    defaultValue: "1",
    componentProps: {
      options: [
        {
          label: "目录",
          value: "1",
        },
        {
          label: "文档",
          value: "2",
        },
      ],
    },
    colSpan: 24,
    rules: [{ required: true, message: "请选择类型" }],
  },
  {
    label: "父级",
    prop: "pid",
    component: "ApiTreeSelect",
    defaultValue: 0,
    componentProps: (_value) => {
      return {
        clearable: true,
        checkStrictly: true,
        api: "/doc/content",
        params: {
          format: "tree",
          project_id: _value.project_id,
        },
        labelField: "name",
        valueField: "id",
      };
    },
    colSpan: 24,
    rules: [],
  },
  {
    label: "标题",
    prop: "title",
    component: "Input",
    colSpan: 24,
    rules: [{ required: true, message: "请输入标题" }],
  },
  {
    label: "内容",
    prop: "content",
    component: "Editor",
    colSpan: 24,
    ifShow(values) {
      return Number(values.type) === 2;
    },
    rules: [],
  },
  {
    label: "权限管控",
    prop: "is_auth",
    component: "Select",
    defaultValue: 1,
    colSpan: 24,
    rules: [{ required: true, message: "请选择权限管控" }],
    componentProps: (_value) => {
      return {
        options: [
          {
            label: "继承权限",
            value: 1,
          },
          {
            label: "公开文档",
            value: 0,
          },
        ],
      };
    },
  },
  {
    label: "排序",
    prop: "sort",
    component: "InputNumber",
    defaultValue: 999,
    colSpan: 24,
    componentProps: {
      clearable: true,
      min: -1,
    },
  },
];

const [BasicForm, formApi] = useForm({
  labelPosition: "right",
  labelWidth: "100px",
  schema: schema,
});

const [Dialog, dialogApi] = useDialog({
  title: "新增",
  width: "70%",
  dialogType: "drawer",
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  draggable: true,
  async onConfirm() {
    formApi.validate().then(async () => {
      const values = await formApi.getValues();
      if (formType.value === "add" || formType.value === undefined) {
        DocContentService.create(values as any);
        crudApi?.value?.refreshCreate();
        ElMessage.success("新增成功");
        dialogApi.close();
      } else if (formType.value === "edit") {
        DocContentService.update(record.value.id, values);
        crudApi?.value?.refreshCreate();
        ElMessage.success("更新成功");
        dialogApi.close();
      }
    });
  },
});

defineExpose({
  async show({
    data,
    getCrudApi,
    type,
  }: {
    data: any;
    getCrudApi: () => CrudMethods;
    type: string | undefined;
  }) {
    record.value = data;
    formType.value = type || "add";

    if (formType.value === "add" || formType.value === undefined) {
      crudApi.value = getCrudApi();
      dialogApi.open();
      nextTick(() => {
        formApi.setValues(record.value);
      });
    } else if (formType.value === "view" || formType.value === "edit") {
      dialogApi.setState({
        title: "编辑文档",
      });
      const res = await DocContentService.get(data.id);
      console.log(res);
      record.value = {
        ...record.value,
        ...res,
      };
      crudApi.value = getCrudApi();
      dialogApi.open();
      nextTick(() => {
        formApi.setValues(record.value);
      });
    }
  },
});
</script>
<style lang="scss" scoped>
.tree-toolbar {
  padding: 10px;
}
</style>
