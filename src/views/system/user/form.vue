<template>
  <Dialog>
    <BasicForm />
  </Dialog>
</template>

<script setup lang="tsx">
import { UserService } from "@/api/system/user";
import { CrudMethods } from "@/components/crud";
import { useDialog } from "@/components/dialog";
import { useForm } from "@/components/form";
import { DictEnum } from "@/enums";
import { $t } from "@/locales";

const [BasicForm, formApi] = useForm({
  labelWidth: "100px",
  schema: [
    // 用户ID（隐藏字段）
    {
      label: $t("system.user.form.modal.id"),
      prop: "id",
      component: "Input",
      colSpan: 12,
      show: false,
      ifDetail: false,
    },

    // 基础信息分隔符
    {
      prop: "baseinfo",
      label: "",
      labelWidth: "0px",
      component: "Divider",
      colSpan: 24,
      componentProps: {
        title: $t("system.user.form.modal.base_info"),
      },
    },
    {
      component: "Input",
      prop: "user_name",
      label: $t("system.user.form.modal.user_name"),
      componentProps: {
        placeholder: $t("system.user.form.placeholder.user_name"),
      },
      colSpan: 12,
      rules: [
        {
          required: true,
          message: $t("system.user.form.placeholder.user_name"),
        },
      ],
    },
    {
      component: "Input",
      prop: "password",
      label: $t("system.user.form.modal.password"),
      componentProps: {
        type: "password",
        showPassword: true,
        placeholder: $t("system.user.form.placeholder.password"),
      },
      rules: [
        {
          required: true,
          message: $t("system.user.form.placeholder.password"),
        },
      ],
      ifShow(values, formApi) {
        return values.id === undefined;
      },
      colSpan: 12,
    },
    {
      component: "Input",
      prop: "real_name",
      label: $t("system.user.form.modal.real_name"),
      componentProps: {
        placeholder: $t("system.user.form.placeholder.real_name"),
      },
      rules: [
        {
          required: true,
          message: $t("system.user.form.placeholder.real_name"),
        },
      ],
      colSpan: 12,
    },
    {
      component: "Input",
      prop: "mobile_phone",
      label: $t("system.user.form.modal.mobile_phone"),
      defaultValue: undefined,
      componentProps: {
        placeholder: $t("system.user.form.placeholder.mobile_phone"),
      },
      rules: [
        {
          required: true,
          message: $t("system.user.form.placeholder.mobile_phone"),
        },
      ],
      colSpan: 12,
    },
    {
      component: "Input",
      prop: "email",
      defaultValue: undefined,
      label: $t("system.user.form.modal.email"),
      componentProps: {
        placeholder: $t("system.user.form.placeholder.email"),
      },
      rules: [
        {
          required: true,
          message: $t("system.user.form.placeholder.email"),
        },
      ],
      colSpan: 12,
    },
    {
      label: $t("system.user.form.modal.sex"),
      prop: "sex",
      component: "ApiDict",
      defaultValue: 0,
      colSpan: 12,
      componentProps: {
        code: DictEnum.SYS_SEX,
        renderType: "RadioGroup",
        isBtn: true,
      },
    },

    // 其他信息分隔符
    {
      prop: "otherinfo",
      label: "",
      labelWidth: "0px",
      component: "Divider",
      colSpan: 24,
      componentProps: {
        title: $t("system.user.form.modal.other_info"),
      },
    },
    {
      prop: "dept_id_list",
      label: $t("system.user.form.modal.dept_id_list"),
      component: "SelectDept",
      colSpan: 24,
      componentProps: {
        placeholder: $t("system.user.form.placeholder.dept_id_list"),
      },
    },
    {
      prop: "post_id_list",
      label: $t("system.user.form.modal.post_id_list"),
      component: "SelectPosition",
      colSpan: 24,
      componentProps: (values) => ({
        deptIds: values.dept_id_list
          ? Array.isArray(values.dept_id_list)
            ? values.dept_id_list
            : [values.dept_id_list]
          : [],
        placeholder: $t("system.user.form.placeholder.post_id_list"),
      }),
    },

    {
      prop: "main_dept_id",
      label: $t("system.user.form.modal.main_dept_id"),
      component: "SelectDept",
      colSpan: 24,
      componentProps: (values) => ({
        multiple: false,
        filterIds: values.dept_id_list
          ? Array.isArray(values.dept_id_list)
            ? values.dept_id_list
            : [values.dept_id_list]
          : [],
        mustInFilterIds: true,
        placeholder: $t("system.user.form.placeholder.main_dept_id"),
      }),
    },

    {
      prop: "main_post_id",
      label: $t("system.user.form.modal.main_post_id"),
      component: "SelectPosition",
      colSpan: 24,
      componentProps: (values) => ({
        deptIds: values.main_dept_id ? [String(values.main_dept_id)] : [],
        multiple: false,
        placeholder: $t("system.user.form.placeholder.main_post_id"),
      }),
    },

    {
      label: $t("system.user.form.modal.role_name"),
      prop: "role_id_list",
      component: "SelectRole",
      colSpan: 24,
      componentProps: {
        placeholder: $t("system.user.form.placeholder.role_id_list"),
      },
      rules: [
        {
          required: false,
          message: $t("system.user.form.placeholder.role_name"),
        },
      ],
    },

    {
      label: $t("system.user.form.modal.avatar"),
      prop: "avatar",
      component: "Avatar",
      colSpan: 24,
      componentProps: {},
    },
    {
      label: $t("system.user.form.modal.remark"),
      prop: "remark",
      component: "Input",
      colSpan: 24,
      componentProps: {
        type: "textarea",
        rows: 4,
        placeholder: $t("system.user.form.placeholder.remark"),
      },
    },
  ],
});
const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const [Dialog, dialogApi] = useDialog({
  title: $t("system.user.form.modal.create"),
  dialogType: "drawer",
  width: "50%",
  onConfirm: async () => {
    formApi
      .validate()
      .then(async () => {
        const values = await formApi.getValues();
        dialogApi.setState({
          loading: true,
          confirmLoading: true,
        });

        const isEdit = !!record.value?.id;
        const submitData = {
          user_name: values.user_name,
          real_name: values.real_name,
          mobile_phone: values.mobile_phone,
          email: values.email,
          sex: values.sex ?? 0,
          avatar: values.avatar,
          remark: values.remark,
          dept_id_list: values.dept_id_list || [],
          post_id_list: values.post_id_list || [],
          role_id_list: values.role_id_list || [],
          main_dept_id: values.main_dept_id || null,
          main_post_id: values.main_post_id || null,
        };

        if (isEdit) {
          submitData.id = record.value.id;
          if (values.password) {
            submitData.password = values.password;
          }
          await UserService.update(record.value.id, submitData);
          ElMessage.success($t("system.user.success.operate"));
        } else {
          submitData.password = values.password;
          await UserService.create(submitData);
          ElMessage.success($t("system.user.success.operate"));
        }

        crudApi.value?.refreshUpdate();
        dialogApi.close();
      })
      .catch(() => {})
      .finally(() => {
        dialogApi.setState({
          loading: false,
          confirmLoading: false,
        });
      });
  },
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    crudApi.value = getCrudApi();

    const isEdit = !!data?.id;

    dialogApi.open();

    if (isEdit) {
      UserService.get(data.id)
        .then((res: any) => {
          nextTick(() => {
            let roleIds: string[] = [];
            if (Array.isArray(res.roles)) {
              roleIds = res.roles.map((role: { id: any }) => String(role.id));
            } else if (res.role_id_list) {
              roleIds = Array.isArray(res.role_id_list)
                ? res.role_id_list
                : res.role_id_list.split(",");
            }

            let postIds: string[] = [];
            if (Array.isArray(res.posts)) {
              postIds = res.posts.map((post: { id: any }) => String(post.id));
            } else if (res.post_id_list) {
              postIds = Array.isArray(res.post_id_list)
                ? res.post_id_list
                : res.post_id_list.split(",");
            }

            let deptIds: string[] = [];
            if (Array.isArray(res.depts)) {
              deptIds = res.depts.map((dept: { id: any }) => String(dept.id));
            } else if (res.dept_id_list) {
              deptIds = Array.isArray(res.dept_id_list)
                ? res.dept_id_list
                : res.dept_id_list.split(",");
            }

            formApi.setValues({
              id: res.id,
              user_name: res.user_name,
              real_name: res.real_name,
              mobile_phone: res.mobile_phone,
              email: res.email,
              sex: res.sex ?? 0,
              avatar: res.avatar,
              remark: res.remark,
              dept_id_list: deptIds,
              post_id_list: postIds,
              role_id_list: roleIds,
              main_dept_id: res.main_dept_id || null,
              main_post_id: res.main_post_id || null,
            });

            dialogApi.setState({
              title: $t("system.user.form.modal.edit"),
            });
          });
        })
        .catch(() => {});
    } else {
      nextTick(() => {
        formApi.resetFields();
        dialogApi.setState({
          title: $t("system.user.form.modal.create"),
        });
      });
    }
  },
});
</script>