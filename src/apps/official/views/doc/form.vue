<template>
  <Dialog>
    <BasicForm>
      <template #thumb="slotProps">
        <PosterUpload
          :value="slotProps.model.thumb"
          @update:value="(val) => (slotProps.model.thumb = val)"
        />
      </template>
    </BasicForm>
  </Dialog>
</template>
<script setup lang="tsx">
import { FormItemSchema, useForm } from "@/components/form";
import { useDialog } from "@/components/dialog";
import { CrudMethods, CrudSchema } from "@/components/crud";
import { DictEnum } from "@/apps/official/enums/dict-enum";
import { RoleService } from "@/api/system/role";
import { ref, nextTick, h } from "vue";
import { ElMessage, ElUpload } from "element-plus";
import { useI18n } from "vue-i18n";
import { $t } from "@/locales";
import { DocProjectService } from "../../api";
import PosterUpload from "@/apps/official/components/poster-upload.vue";

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
    prop: "thumb",
    label: "缩略图",
    component: "Input",
    colSpan: 24,
  },

  {
    label: "唯一编码",
    prop: "code",
    component: "Input",
    colSpan: 24,
    rules: [],
  },
  {
    label: "显示名称",
    prop: "title",
    component: "Input",
    colSpan: 24,
    rules: [],
  },

  {
    label: "权限管控",
    prop: "auth_type",
    component: "ApiDict",
    defaultValue: 0,
    colSpan: 24,
    rules: [],
    componentProps: (_value) => {
      return {
        code: DictEnum.DOC_PERMISSION_TYPE,
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
  {
    label: "首页显示",
    prop: "app",
    component: "ApiDict",
    defaultValue: 1,
    colSpan: 12,
    rules: [],
    componentProps: (_value) => {
      return {
        code: DictEnum.SYS_ENABLED_STATUS,
        isBtn: true,
        renderType: "RadioGroup",
      };
    },
  },
  {
    label: "启用状态",
    prop: "enabled",
    component: "ApiDict",
    defaultValue: 1,
    colSpan: 12,
    rules: [],
    componentProps: (_value) => {
      return {
        code: DictEnum.SYS_ENABLED_STATUS,
        isBtn: true,
        renderType: "RadioGroup",
      };
    },
  },
  {
    label: "协助分组",
    prop: "role_ids",
    component: "ApiSelect",
    defaultValue: "",
    colSpan: 24,
    rules: [],
    componentProps: (_value) => {
      return {
        api: "/system/role",
        requestMethod: "GET",
        placeholder: "请选择协作分组",
      };
    },
  },
  {
    label: "协作用户",
    prop: "admin_ids",
    component: "ApiSelect",
    defaultValue: "",
    colSpan: 24,
    rules: [],
    componentProps: (_value) => {
      return {
        api: "/system/admin",
        requestMethod: "GET",
        placeholder: "请选择协作用户",
      };
    },
  },
  {
    label: "描述",
    prop: "desc",
    component: "Input",
    colSpan: 24,
    defaultValue: "",
    componentProps: {
      rows: 4,
      type: "textarea",
      clearable: true,
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
        DocProjectService.create(values as any);
        crudApi?.value?.refreshCreate();
        ElMessage.success("新增成功");
        dialogApi.close();
      } else if (formType.value === "edit") {
        DocProjectService.update(record.value.id, values);
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
      const res = await DocProjectService.get(data.id);
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
<style lang="scss" scoped></style>
