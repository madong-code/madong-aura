<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';
import { ProfileService } from '#/api/auth/profile';
import { Icon } from '#/components/icon';
import { Page } from '#/components/page';
import { useUserStore } from '#/core/stores';
import { $t } from '#/locales';

const userStore = useUserStore();
const isEdit = ref(false);
const loading = ref(false);

const allFields = [
  'real_name',
  'nick_name',
  'sex',
  'email',
  'mobile_phone',
  'address',
  'signed',
] as const;

const [BasicForm, formApi] = useVbenForm({
  showDefaultActions: false,
  layout: 'vertical',
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      fieldName: 'real_name',
      label: $t('system.profile.setting.real_name'),
      component: 'Input',
      formItemClass: 'col-span-2 md:w-1/2',
      disabled: true,
      rules: z
        .string()
        .min(2, $t('system.profile.setting.rules_real_name'))
        .max(50),
      componentProps: {
        placeholder: $t('system.profile.setting.placeholder_real_name'),
      },
    },
    {
      fieldName: 'nick_name',
      formItemClass: 'col-span-2 md:w-1/2',
      label: $t('system.profile.setting.nick_name'),
      component: 'Input',
      disabled: true,
      rules: z
        .string()
        .min(2, $t('system.profile.setting.rules_nick_name'))
        .max(30),
      componentProps: {
        placeholder: $t('system.profile.setting.placeholder_nick_name'),
      },
    },
    {
      fieldName: 'sex',
      label: $t('system.profile.setting.sex'),
      component: 'Select',
      disabled: true,
      rules: 'selectRequired',
      formItemClass: 'col-span-2 md:w-1/2',
      componentProps: {
        placeholder: $t('system.profile.setting.select_sex'),
        options: [
          { value: 0, label: $t('system.profile.setting.sex_unknown') },
          { value: 1, label: $t('system.profile.setting.sex_male') },
          { value: 2, label: $t('system.profile.setting.sex_female') },
        ],
      },
    },
    {
      fieldName: 'email',
      label: $t('system.profile.setting.email'),
      component: 'Input',
      formItemClass: 'col-span-2 md:w-1/2',
      disabled: true,
      rules: z.string().email($t('system.profile.setting.rules_email')),
      componentProps: {
        placeholder: $t('system.profile.setting.placeholder_email'),
      },
    },
    {
      fieldName: 'mobile_phone',
      label: $t('system.profile.setting.mobile_phone'),
      component: 'Input',
      formItemClass: 'col-span-2 md:w-1/2',
      disabled: true,
      rules: z
        .string()
        .regex(/^1[3-9]\d{9}$/, $t('system.profile.setting.rules_mobile')),
      componentProps: {
        placeholder: $t('system.profile.setting.placeholder_mobile'),
      },
    },
    {
      fieldName: 'address',
      label: $t('system.profile.setting.address'),
      component: 'Input',
      formItemClass: 'col-span-2 md:w-1/2',
      disabled: true,
      componentProps: {
        placeholder: $t('system.profile.setting.placeholder_address'),
      },
    },
    {
      fieldName: 'signed',
      label: $t('system.profile.setting.signed'),
      component: 'Input',
      disabled: true,
      formItemClass: 'col-span-2',
      componentProps: {
        type: 'textarea',
        rows: 3,
        placeholder: $t('system.profile.setting.placeholder_signed'),
      },
    },
  ],
});

function setFieldsDisabled(disabled: boolean) {
  formApi.updateSchema(
    allFields.map((field) => ({
      fieldName: field,
      disabled,
    })),
  );
}

async function loadProfile() {
  try {
    const resp = (await ProfileService.getProfile()) as Record<string, any>;
    await formApi.setValues({
      real_name: resp.real_name || '',
      nick_name: resp.nick_name || '',
      sex: resp.sex ?? 0,
      email: resp.email || '',
      mobile_phone: resp.mobile_phone || '',
      address: resp.address || '',
      signed: resp.signed || '',
    });
  } catch {
    ElMessage.error($t('system.profile.setting.load_fail'));
  }
}

async function handleSave() {
  if (!isEdit.value) {
    isEdit.value = true;
    setFieldsDisabled(false);
    return;
  }

  const { valid } = await formApi.validate();
  if (!valid) return;

  try {
    await ElMessageBox.confirm(
      $t('system.profile.setting.confirm_save'),
      $t('system.profile.setting.confirm_title'),
      {
        confirmButtonText: $t('system.profile.setting.confirm_ok'),
        cancelButtonText: $t('system.profile.setting.confirm_cancel'),
        type: 'warning',
      },
    );

    loading.value = true;
    const values = await formApi.getValues();
    await ProfileService.updateProfile(values as any);

    const newUser = (await ProfileService.getProfile()) as any;
    userStore.setUserInfo(newUser);

    ElMessage.success($t('system.profile.setting.success'));
    isEdit.value = false;
    setFieldsDisabled(true);
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error($t('system.profile.setting.fail'));
    }
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  isEdit.value = false;
  setFieldsDisabled(true);
  loadProfile();
}

onMounted(() => {
  loadProfile();
});
</script>

<template>
  <Page :title="$t('system.profile.setting.title')">
    <BasicForm />
    <div class="flex items-center gap-3 pt-2">
      <ElButton v-if="isEdit" @click="handleCancel">
        <Icon icon="ant-design:close-outlined" class="mr-1" />{{
          $t('system.profile.setting.cancel')
        }}
      </ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSave">
        <Icon v-if="isEdit" icon="ant-design:check-outlined" class="mr-1" />
        <Icon v-else icon="ant-design:edit-outlined" class="mr-1" />
        {{
          isEdit
            ? $t('system.profile.setting.save')
            : $t('system.profile.setting.edit')
        }}
      </ElButton>
    </div>
  </Page>
</template>

<style scoped></style>
