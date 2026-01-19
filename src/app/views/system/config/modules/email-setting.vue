<script lang="tsx" setup>
import { useForm } from "@/components/form";
import { $t } from "@/locales";
import { transformData } from "../schemas";
import { ConfigService } from "@/app/api/system/config";

const fieldLink = {
  Host: $t("system.config.email.Host"),
  Port: $t("system.config.email.Port"),
  Username: $t("system.config.email.Username"),
  Password: $t("system.config.email.Password"),
  SMTPSecure: $t("system.config.email.SMTPSecure"),
  From: $t("system.config.email.From"),
  FromName: $t("system.config.email.FromName"),
  email: $t("system.config.email.test"),
};

const [BasicForm, formApi] = useForm({
  labelPosition: "right",
  labelWidth: "130px",
  inline: false,
  schema: [
    {
      prop: "Host",
      label: $t("system.config.email.Host"),
      component: "Input",
      componentProps: {
        placeholder: $t("system.config.email.placeholder.Host"),
        allowClear: true,
        style: { width: "40%" },
      },
      rules: [
        {
          required: true,
          message: $t("system.config.email.placeholder.Host"),
        },
      ],
    },
    {
      prop: "Port",
      label: $t("system.config.email.Port"),
      component: "Input",
      componentProps: {
        placeholder: $t("system.config.email.placeholder.Port"),
        allowClear: true,
        style: { width: "40%" },
      },
      rules: [
        {
          required: true,
          message: $t("system.config.email.placeholder.Port"),
        },
      ],
    },
    {
      prop: "Username",
      label: $t("system.config.email.Username"),
      component: "Input",
      componentProps: {
        placeholder: $t("system.config.email.placeholder.Username"),
        style: { width: "40%" },
      },
      rules: [
        {
          required: true,
          message: $t("system.config.email.placeholder.Username"),
        },
      ],
    },
    {
      prop: "Password",
      label: $t("system.config.email.Password"),
      component: "Input",
      componentProps: {
        placeholder: $t("system.config.email.placeholder.Password"),
        style: { width: "40%" },
        allowClear: true,
      },
      rules: [
        {
          required: true,
          message: $t("system.config.email.placeholder.Password"),
        },
      ],
    },
    {
      prop: "SMTPSecure",
      label: $t("system.config.email.SMTPSecure"),
      component: "RadioGroup",
      defaultValue: "ssl",
      componentProps: {
        options: [
          {
            label: "ssl",
            value: "ssl",
          },
          {
            label: "tsl",
            value: "tsl",
          },
        ],
      },
      rules: [
        {
          required: true,
        },
      ],
    },

    {
      prop: "From",
      label: $t("system.config.email.From"),
      component: "Input",
      componentProps: {
        placeholder: $t("system.config.email.placeholder.From"),
        allowClear: true,
        style: { width: "40%" },
      },
      rules: [
        {
          required: true,
          message: $t("system.config.email.placeholder.From"),
        },
      ],
    },
    {
      prop: "FromName",
      label: $t("system.config.email.FromName"),
      component: "Input",
      componentProps: {
        placeholder: $t("system.config.email.placeholder.FromName"),
        allowClear: true,
        style: { width: "40%" },
      },
      rules: [
        {
          required: true,
          message: $t("system.config.email.placeholder.FromName"),
        },
      ],
    },
  ],
});

function onSubmit() {
  formApi.validate().then(async (e: any) => {
    const values = await formApi.getValues();
    const data = transformData(
      values,
      ["btn", "email"],
      [],
      {
        group_code: "email_setting",
      },
      fieldLink
    );
    ConfigService.save(data).then(() => {
      ElMessage.success($t("common.operation_success"));
      retrieveData();
    });
  });
}

/**
 * 获取表单数据
 */
const retrieveData = async () => {
  const record = (await ConfigService.get({ group_code: "email_setting" })) as any;
  await formApi.setValues({ ...record });
};

onMounted(async () => {
  retrieveData();
});
</script>

<template>
  <div>
    <BasicForm />
    <el-button class="site-sumbit" type="primary" @click="onSubmit">保存</el-button>
  </div>
</template>
