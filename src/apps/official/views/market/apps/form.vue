<template>
  <Dialog>
    <BasicForm>
      <template #thumb="slotProps">
        <PosterUpload
          :value="slotProps.model.thumb"
          @update:value="(val:any) => (slotProps.model.thumb = val)"
        />
      </template>
      <template #carousel="slotProps">
        <CarouselUpload
          :value="slotProps.model.carousel"
          @update:value="(val:any) => (slotProps.model.carousel = val)"
        />
      </template>
      <template #download_url="slotProps">
        <SingleUpload
          :value="slotProps.model.download_url"
          @update:value="(val:any) => (slotProps.model.download_url = val)"
          accept=".zip"
          button-text="上传压缩包"
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
import { ref, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { $t } from "@/locales";
import PosterUpload from "@/apps/official/components/poster-upload.vue";
import CarouselUpload from "@/apps/official/components/carousel-upload.vue";
import SingleUpload from "@/apps/official/components/single-upload.vue";
import { MarketAppService } from "@/apps/official/api/market/app";
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
    label: "应用类型",
    prop: "category_id",
    component: "ApiSelect",
    colSpan: 12,
    componentProps: (_value) => {
      return {
        clearable: true,
        api: "/market/category",
        params: {
          format: "select",
        },
      };
    },
    rules: [{ required: true, message: "请选择应用类型" }],
  },
  {
    label: "排序",
    prop: "sort_weight",
    component: "InputNumber",
    defaultValue: 0,
    colSpan: 12,
    componentProps: {
      clearable: true,
      min: -1,
    },
  },
  {
    label: "应用标识",
    prop: "code",
    component: "Input",
    colSpan: 12,
    rules: [{ required: true, message: "请输入应用标识" }],
  },
  {
    label: "应用名称",
    prop: "name",
    component: "Input",
    colSpan: 12,
    rules: [{ required: true, message: "请输入应用名称" }],
  },

  {
    label: "应用描述",
    prop: "description",
    component: "Input",
    componentProps: {
      type: "textarea",
      rows: 4,
    },
    colSpan: 24,
    rules: [{ required: true, message: "请输入应用描述" }],
  },

  {
    label: "轮播图集",
    prop: "carousel",
    component: "Input",
    colSpan: 24,
    ifDetail: false,
  },
  {
    label: "页面内容",
    prop: "readme_content",
    component: "Editor",
    componentProps: {},
    colSpan: 24,
    rules: [{ required: true, message: "请输入页面内容" }],
  },
  {
    label: "附件",
    prop: "download_url",
    component: "Input",
    colSpan: 12,
    ifShow(values, formApi) {
      return formType.value === "add" || formType.value === undefined;
    },
  },
  {
    label: "是否上架",
    prop: "status",
    component: "ApiDict",
    defaultValue: 1,
    colSpan: 12,
    rules: [],
    componentProps: (_value) => {
      return {
        code: DictEnum.SYS_YES_NO,
        isBtn: true,
        renderType: "RadioGroup",
      };
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
  modal: false,
  closeOnClickModal: true,
  destroyOnClose: true,
  draggable: true,
  async onConfirm() {
    formApi.validate().then(async () => {
      const values = await formApi.getValues();
      if (formType.value === "add" || formType.value === undefined) {
        MarketAppService.create(values as any);
        crudApi?.value?.refreshCreate();
        ElMessage.success("新增成功");
        dialogApi.close();
      } else if (formType.value === "edit") {
        MarketAppService.update(record.value.id, values);
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
        title: "编辑",
      });
      const res = (await MarketAppService.get(data.id)) as any;
      record.value = {
        ...record.value,
        ...res,
      };

      // 处理轮播图数据：提取 carousels 中的 image_url 数组
      if (res?.carousels && Array.isArray(res.carousels)) {
        record.value.carousel = res.carousels
          .sort((a: any, b: any) => b.sort_weight - a.sort_weight)
          .map((item: any) => item.image_url);
      }

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
