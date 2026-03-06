<template>
  <Dialog>
    <BasicForm>
      <template #download_url="slotProps">
        <SingleUpload
          :value="slotProps.model.download_url"
          @update:value="(val:any) => (slotProps.model.download_url = val)"
          accept=".zip"
          button-text="上传附件"
        />
      </template>
    </BasicForm>
  </Dialog>
</template>
<script setup lang="tsx">
import { FormItemSchema, useForm } from "@/components/form";
import { useDialog } from "@/components/dialog";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import SingleUpload from "@/apps/official/components/single-upload.vue";
import { CrudMethods } from "@/components/crud";
import { MarketAppService } from "@/apps/official/api/market";

const record = ref<any>({});
const formType = ref("add");
const crudApi = ref<CrudMethods>();

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
    label: "附件",
    prop: "download_url",
    component: "Input",
    colSpan: 24,
    ifDetail: false,
    rules: [{ required: true, message: "请上传附件" }],
  },
  {
    label: "版本号",
    prop: "version",
    component: "Input",
    colSpan: 24,
    rules: [{ required: true, message: "请输入版本号" }],
    componentProps: {
      clearable: true,
      placeholder: "例如：v1.0.2",
    },
  },

  {
    label: "发布日志",
    prop: "release_notes",
    component: "Editor",
    colSpan: 24,
    rules: [{ required: true, message: "请输入发布日志" }],
  },
];

const [BasicForm, formApi] = useForm({
  labelPosition: "right",
  labelWidth: "100px",
  schema: schema,
});

const [Dialog, dialogApi] = useDialog({
  title: "发布版本",
  width: "70%",
  modal: false,
  dialogType: "drawer",
  closeOnClickModal: false,
  destroyOnClose: true,
  draggable: true,
  async onConfirm() {
    formApi.validate().then(async () => {
      const values = (await formApi.getValues()) as any;
      await MarketAppService.publishVersion(values);
      ElMessage.success("版本发布成功");
      crudApi?.value?.refreshCreate();
      dialogApi.close();
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
    crudApi.value = getCrudApi();
    // 使用解构断开引用关联，并排除不需要的字段
    const { id, download_url, ...rest } = data;
    record.value = {
      id,
      ...rest,
    };
    formType.value = type || "add";

    // 自动生成新版本号：当前版本 + 0.1
    if (data.version) {
      const parts = data.version.replace("v", "").split(".").map(Number);
      // 增加最后一位（patch版本）
      parts[2] = (parts[2] || 0) + 1;
      const newVersion = `v${parts[0]}.${parts[1]}.${parts[2]}`;
      record.value.version = newVersion;
    }

    dialogApi.open();
    nextTick(() => {
      formApi.setValues(record.value);
    });
  },
});
</script>
