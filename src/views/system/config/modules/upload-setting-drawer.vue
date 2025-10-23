<script lang="tsx" setup>
import { ConfigService } from "@/api/system/config";
import { useDialog } from "@/components/dialog";
import { useForm } from "@/components/form";
import { $t } from "@/locales";

const data = ref();
const record = ref();

const [BasicForm, formApi] = useForm({
  labelPosition: "right",
  labelWidth: "130px",
  schema: [
    {
      prop: "mode",
      label: "",
      component: "Input",
      ifShow: false,
    },
    {
      prop: "root",
      label: $t("system.config.upload.extend.root"),
      component: "RadioGroup",
      rules: [
        {
          required: true,
        },
      ],
      componentProps: {
        placeholder: "",
        allowClear: true,
        options: [
          {
            label: "不公开（runtime目录）",
            value: "runtime",
          },
          {
            label: "公开（public目录）",
            value: "public",
          },
        ],
      },
      ifShow: (values: any) => {
        if (values) {
          return ["local"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "secretId",
      label: $t("system.config.upload.extend.secretId"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["cos"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "accessKey",
      label: $t("system.config.upload.extend.accessKey"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["qiniu"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "accessKeyId",
      label: $t("system.config.upload.extend.accessKeyId"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["oss"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "secretKey",
      label: $t("system.config.upload.extend.secretKey"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["cos", "qiniu"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "key",
      label: $t("system.config.upload.extend.key"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["s3"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "accessKeySecret",
      label: $t("system.config.upload.extend.accessKeySecret"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["oss"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "secret",
      label: $t("system.config.upload.extend.secret"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["s3"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "bucket",
      label: $t("system.config.upload.extend.bucket"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["oss", "cos", "qiniu", "s3"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "dirname",
      label: $t("system.config.upload.extend.dirname"),
      rules: [
        {
          required: true,
        },
      ],
    },
    {
      component: "Input",
      prop: "domain",
      label: $t("system.config.upload.extend.domain"),
      rules: [
        {
          required: true,
        },
      ],
      ifShow: (values: any) => {
        if (values) {
          return ["local", "oss", "cos", "qiniu", "s3"].includes(values.mode);
        }
        return false;
      },
    },

    {
      component: "Input",
      prop: "endpoint",
      label: $t("system.config.upload.extend.endpoint"),
      ifShow: (values: any) => {
        if (values) {
          return ["oss", "qiniu", "s3"].includes(values.mode);
        }
        return false;
      },
    },

    {
      component: "Input",
      prop: "region",
      label: $t("system.config.upload.extend.region"),
      ifShow: (values: any) => {
        if (values) {
          return ["cos", "s3"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      prop: "acl",
      label: $t("system.config.upload.extend.acl"),
      ifShow: (values: any) => {
        if (values) {
          return ["s3"].includes(values.mode);
        }
        return false;
      },
    },
    {
      component: "Input",
      componentProps: {
        type: "textarea",
      },
      prop: "remark",
      label: $t("system.config.upload.extend.remark"),
    },
  ],
});

// const [Drawer, drawerApi] = useDrawer({
//   onCancel() {
//     drawerApi.close();
//   },
//   async onConfirm() {
//     const values = await formApi.getValues();
//     const field = templateField(data.value.mode);
//     let datas = transformData(
//       values,
//       ["btn"],
//       field,
//       { group_code: data.value.mode },
//       fieldLink
//     );
//     if (field.length == 0) {
//       datas = [];
//     }
//     save(datas).then(() => {
//       message.success($t("common.message.success"));
//       retrieveData();
//     });
//   },

//   async onOpenChange(isOpen: boolean) {
//     if (!isOpen) {
//       return null;
//     }
//     retrieveData();
//   },
// });

const [Dialog, dialogApi] = useDialog({
  title: "选择权限",
  width: "70%",
  modal: true,
  dialogType: "drawer",
  direction: "rtl",
  closeOnClickModal: true,
  destroyOnClose: true,
  onConfirm() {},
});

/**
 * 获取配置信息
 */
const retrieveData = async function () {
  const record = (await ConfigService.get({ group_code: data.value.mode })) as any;
  await formApi.setValues({ ...record, mode: data.value.mode });
};

defineExpose({
  show(args: any) {
    data.value = args;
    dialogApi.setState({
      title: `更多设置`,
    });
    dialogApi.open();
    nextTick(async () => {
      retrieveData();
    });
  },
});
</script>
<template>
  <Dialog title="更多设置" class="w-[650px]">
    <BasicForm />
  </Dialog>
</template>
