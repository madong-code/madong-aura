<template>
  <Dialog>
    <div class="p-5">
      <BasicForm class="padding-20">
        <!-- 图标上传插槽 -->
        <template #icon="slotProps">
          <PluginImageUpload v-model="slotProps.model.icon" upload-type="icon" />
        </template>

        <!-- 封面上传插槽 -->
        <template #cover="slotProps">
          <PluginImageUpload v-model="slotProps.model.cover" upload-type="cover" />
        </template>
      </BasicForm>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useDialog } from "@/components/dialog";
import { useForm } from "@/components/form";
import { CrudMethods } from "@/components/crud";
import PluginDevelopService from "@/api/tools/apps/develop";
import PluginImageUpload from "./plugin-image-upload.vue";

const isEdit = ref(false);
const currentRecord = ref<any>();
const crudApi = ref<CrudMethods>();

const [BasicForm, formApi] = useForm({
  labelPosition: "left",
  labelWidth: "100px",
  schema: [
    {
      prop: "id",
      label: "ID",
      component: "Input",
      colSpan: 24,
      show: false,
      ifDetail: false,
    },
    {
      prop: "icon",
      label: "图标",
      component: "Input",
      colSpan: 24,
    },
    {
      prop: "cover",
      label: "封面",
      component: "Input",
      colSpan: 24,
    },
    {
      prop: "key",
      label: "标识",
      component: "Input",
      componentProps: (_values) => ({
        placeholder: "请输入插件标识",
        style: { width: "100%" },
        disabled: _values.id !== undefined && _values.id !== null,
      }),
      rules: [
        { required: true, message: "请输入插件标识", trigger: "blur" },
        {
          pattern: /^[a-z][a-z0-9_]*$/,
          message: "标识只能包含小写字母、数字和下划线,且以字母开头",
          trigger: "blur",
        },
      ],
      colSpan: 24,
    },
    {
      prop: "title",
      label: "标题",
      component: "Input",
      componentProps: {
        placeholder: "请输入插件标题",
        style: { width: "100%" },
      },
      rules: [{ required: true, message: "请输入插件标题", trigger: "blur" }],
      colSpan: 24,
    },
    {
      prop: "author",
      label: "作者",
      component: "Input",
      componentProps: {
        placeholder: "请输入作者",
        style: { width: "100%" },
      },
      rules: [{ required: true, message: "请输入作者", trigger: "blur" }],
      colSpan: 24,
    },
    {
      prop: "version",
      label: "版本",
      component: "Input",
      defaultValue: "1.0.0",
      componentProps: {
        placeholder: "请输入版本号",
        style: { width: "100%" },
      },
      rules: [{ required: true, message: "请输入版本号", trigger: "blur" }],
      colSpan: 24,
    },
    {
      prop: "type",
      label: "类型",
      component: "Select",
      defaultValue: "madong:plugin",
      componentProps: {
        placeholder: "请选择类型",
        style: { width: "100%" },
        options: [
          { label: "应用", value: "madong:app" },
          { label: "模块", value: "madong:plugin" },
        ],
      },
      rules: [{ required: true, message: "请选择类型", trigger: "change" }],
      colSpan: 24,
    },
    {
      prop: "desc",
      label: "描述",
      component: "Input",
      componentProps: {
        type: "textarea",
        rows: 4,
        placeholder: "请输入插件描述",
        style: { width: "100%" },
      },
      colSpan: 24,
    },
  ],
});

const [Dialog, dialogApi] = useDialog({
  title: "插件",
  width: "70%",
  dialogType: "drawer",
  footer: true,
  modal: true,
  closeOnClickModal: false,
  destroyOnClose: true,
  fullscreen: false,
  async onConfirm() {
    formApi.validate().then(async () => {
      const values = await formApi.getValues();

      if (isEdit.value) {
        await PluginDevelopService.update(currentRecord.value.id, values);
        crudApi.value?.refreshUpdate();
        ElMessage.success("更新成功");
      } else {
        await PluginDevelopService.create(values as any);
        crudApi.value?.refreshCreate();
        ElMessage.success("创建成功");
      }
      dialogApi.close();
    });
  },
});

const show = (crudApiParam: CrudMethods, record?: any, type = "add") => {
  isEdit.value = type === "edit";
  currentRecord.value = record;
  crudApi.value = crudApiParam;
  dialogApi.open();
  if (type === "edit" && record) {
    PluginDevelopService.get(record.id).then((res) => {
      formApi.setValues({
        id: res.id,
        title: res.title || "",
        key: res.key || "",
        desc: res.desc || "",
        author: res.author || "",
        version: res.version || "1.0.0",
        type: res.type || "madong:plugin",
        icon: res.icon || "",
        cover: res.cover || "",
      });
    });
  }
};

defineExpose({ show });
</script>

<style lang="scss" scoped>
.padding-20 {
  padding: 0;
}
</style>
