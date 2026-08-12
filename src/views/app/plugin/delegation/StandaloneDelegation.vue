<script setup lang="ts">
import type { AuthInfo } from '#/api/app/plugin/delegation/types';

/** 单端版授权信息：卡片式授权码展示 + 对话框认证*/
import { onMounted, ref } from 'vue';

import { ElButton, ElCard, ElIcon, ElPopover } from 'element-plus';
import { Eye, EyeOff } from 'lucide-vue-next';

import { AppPluginDelegationService } from '#/api/app/plugin/delegation';
import { $t } from '#/locales';

import AuthorizationDialog from './AuthorizationDialog.vue';

defineOptions({ name: 'StandaloneDelegation' });

const loading = ref(true);

const authInfo = ref<AuthInfo>({
  company_name: '',
  domain: '',
  auth_code: '',
});

const isCodeVisible = ref(false);
const authDialogRef = ref<typeof AuthorizationDialog>();
const permissionCodePopoverRef = ref();

onMounted(async () => {
  try {
    authInfo.value = (await AppPluginDelegationService.getAuthInfo()) || {};
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
});

const handleAuthDialogOpen = () => {
  authDialogRef.value?.openDialog();
};

const toggleCodeVisibility = () => {
  isCodeVisible.value = !isCodeVisible.value;
};

const hideAuthCode = (code: string) => {
  if (!code) return '--';
  return code.replaceAll(/.(?=.{4})/g, '*');
};

const handleNavigateToMarket = () => {
  window.open('https://www.madong.tech/apps');
};

const handlePermissionCodeClose = () => {
  permissionCodePopoverRef.value?.hide?.();
};

const handleAuthSuccess = async () => {
  const data = await AppPluginDelegationService.getAuthInfo();
  authInfo.value = data || {};
};
</script>

<template>
  <div v-loading="loading" class="h-full">
    <ElCard shadow="never" class="rounded-xl">
      <template #header>
        <span class="text-base font-bold">{{
          $t('app.plugin.auth.title')
        }}</span>
      </template>
      <div class="flex items-center">
        <div
          class="w-24 h-24 rounded-lg flex justify-center items-center mr-5 bg-blue-50"
        >
          <svg
            class="w-16 h-16 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div class="flex flex-col justify-between font-medium">
          <div class="flex flex-wrap items-center mb-3">
            <span class="mr-1.5 text-sm text-gray-600 w-25 text-left">
              {{ $t('app.plugin.auth.company') }}：
            </span>
            <span class="text-sm text-gray-800">{{
              authInfo.company_name || '--'
            }}</span>
          </div>
          <div class="flex flex-wrap items-center mb-3">
            <span class="mr-1.5 text-sm text-gray-600 w-25 text-left">
              {{ $t('app.plugin.auth.domain') }}：
            </span>
            <span class="text-sm text-gray-800">{{
              authInfo.domain || '--'
            }}</span>
          </div>
          <div class="flex flex-wrap items-center">
            <span class="mr-1.5 text-sm text-gray-600 w-25 text-left">
              {{ $t('app.plugin.auth.auth_code') }}：
            </span>
            <span class="text-sm text-gray-800">
              <span class="mr-2.5">{{
                authInfo.auth_code
                  ? isCodeVisible
                    ? authInfo.auth_code
                    : hideAuthCode(authInfo.auth_code)
                  : '--'
              }}</span>
              <ElIcon
                v-if="!isCodeVisible"
                @click="toggleCodeVisibility"
                class="text-sm cursor-pointer text-gray-500"
              >
                <Eye />
              </ElIcon>
              <ElIcon
                v-else
                @click="toggleCodeVisibility"
                class="text-sm cursor-pointer text-gray-500"
              >
                <EyeOff />
              </ElIcon>
            </span>
          </div>
        </div>
      </div>

      <div class="mt-4 ml-28">
        <ElButton
          class="w-35 h-8 mt-2 rounded"
          type="primary"
          @click="handleAuthDialogOpen"
        >
          {{ $t('app.plugin.auth.auth_button') }}
        </ElButton>
        <ElPopover
          ref="permissionCodePopoverRef"
          placement="bottom-start"
          :width="478"
          trigger="click"
          class="mt-2"
        >
          <div class="px-4 py-2">
            <p class="leading-8 text-sm">
              {{ $t('app.plugin.auth.get_from_website') }}
            </p>
            <div class="flex justify-end mt-9">
              <ElButton class="w-45 h-12" @click="handleNavigateToMarket">
                {{ $t('app.plugin.auth.go_to_market') }}
              </ElButton>
              <ElButton class="w-25 h-12" @click="handlePermissionCodeClose">
                {{ $t('app.plugin.auth.close') }}
              </ElButton>
            </div>
          </div>
          <template #reference>
            <ElButton
              class="w-35 h-8 mt-2 rounded text-primary hover:text-primary bg-transparent"
            >
              {{ $t('app.plugin.auth.how_to_get') }}
            </ElButton>
          </template>
        </ElPopover>
      </div>
    </ElCard>

    <AuthorizationDialog ref="authDialogRef" @success="handleAuthSuccess" />
  </div>
</template>
