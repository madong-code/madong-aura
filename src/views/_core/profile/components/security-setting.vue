<script setup lang="ts">
import { ref } from 'vue';

import { ElButton, ElLoading, ElMessage } from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';
import { ProfileService } from '#/api/auth/profile';
import { Icon } from '#/components/icon';
import { Page } from '#/components/page';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';

const isEdit = ref(false);
const loading = ref(false);

const allFields = ['oldPassword', 'newPassword', 'confirmPassword'] as const;

const [PasswordForm, formApi] = useVbenForm({
  showDefaultActions: false,
  layout: 'vertical',
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      fieldName: 'oldPassword',
      label: $t('system.profile.security.old_password'),
      component: 'Password',
      formItemClass: 'col-span-2 md:w-1/2',
      disabled: true,
      rules: z
        .string()
        .min(1, $t('system.profile.security.rules_old_password')),
      componentProps: {
        placeholder: $t('system.profile.security.placeholder_old_password'),
      },
    },
    {
      fieldName: 'newPassword',
      label: $t('system.profile.security.new_password'),
      component: 'Password',
      formItemClass: 'col-span-2 md:w-1/2',
      disabled: true,
      componentProps: {
        passwordStrength: true,
        placeholder: $t('system.profile.security.placeholder_new_password'),
      },
      rules: z
        .string()
        .min(6, $t('system.profile.security.rules_new_password'))
        .max(30, $t('system.profile.security.rules_new_password_max')),
    },
    {
      fieldName: 'confirmPassword',
      label: $t('system.profile.security.confirm_password'),
      component: 'Password',
      formItemClass: 'col-span-2 md:w-1/2',
      disabled: true,
      componentProps: {
        placeholder: $t('system.profile.security.placeholder_confirm_password'),
      },
      dependencies: {
        rules(values: any) {
          const { newPassword } = values;
          return z
            .string({
              required_error: $t(
                'system.profile.security.rules_confirm_required',
              ),
            })
            .min(1, {
              message: $t('system.profile.security.rules_confirm_required'),
            })
            .refine((value: string) => value === newPassword, {
              message: $t('system.profile.security.rules_confirm_not_match'),
            });
        },
        triggerFields: ['newPassword'],
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

async function handleSave() {
  if (!isEdit.value) {
    isEdit.value = true;
    setFieldsDisabled(false);
    return;
  }

  const { valid } = await formApi.validate();
  if (!valid) return;

  const values = await formApi.getValues();
  const loadingInstance = ElLoading.service({
    lock: true,
    text: $t('system.profile.security.loading_text'),
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    await ProfileService.updatePassword({
      old_password: values.oldPassword,
      new_password: values.newPassword,
      confirm_password: values.confirmPassword,
    });

    let seconds = 5;
    let messageHandler: any = null;

    const updateMessage = () => {
      if (messageHandler) messageHandler.close();
      messageHandler = ElMessage.success({
        message: $t('system.profile.security.success', { seconds }),
        duration: 0,
        showClose: true,
      });
    };

    updateMessage();

    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        if (messageHandler) messageHandler.close();
        const authStore = useAuthStore();
        authStore.logout();
      } else {
        updateMessage();
      }
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error?.message || $t('system.profile.security.fail'));
  } finally {
    loadingInstance.close();
    isEdit.value = false;
    setFieldsDisabled(true);
  }
}

function handleCancel() {
  isEdit.value = false;
  setFieldsDisabled(true);
  formApi.resetForm();
}
</script>

<template>
  <Page :title="$t('system.profile.security.title')">
    <PasswordForm />
    <div class="flex items-center gap-3 pt-2">
      <ElButton v-if="isEdit" @click="handleCancel">
        <Icon icon="ant-design:close-outlined" class="mr-1" />{{
          $t('system.profile.security.cancel')
        }}
      </ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSave">
        <Icon v-if="isEdit" icon="ant-design:check-outlined" class="mr-1" />
        <Icon v-else icon="ant-design:edit-outlined" class="mr-1" />
        {{
          isEdit
            ? $t('system.profile.security.save')
            : $t('system.profile.security.edit')
        }}
      </ElButton>
    </div>
  </Page>
</template>
