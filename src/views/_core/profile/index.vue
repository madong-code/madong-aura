<script setup lang="ts">
import { ElMessage } from 'element-plus';

import { Page } from '#/components/page';
import { useUserStore } from '#/core/stores';
import { $t } from '#/locales';

import BaseSetting from './components/base-setting.vue';
import OnlineDevice from './components/online-device.vue';
import ProfileCard from './components/profile-card.vue';
import SecuritySetting from './components/security-setting.vue';

const userStore = useUserStore();

function handleAvatarSuccess(newUrl: string) {
  if (!newUrl || newUrl === userStore.userInfo?.avatar) return;
  const info = userStore.userInfo as Record<string, any>;
  if (info) {
    userStore.setUserInfo({ ...info, avatar: newUrl } as any);
  }
  ElMessage.success($t('system.profile.avatar.success'));
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
      <ProfileCard @avatar-success="handleAvatarSuccess" />

      <div class="flex-1 min-w-0 space-y-4">
        <div
          class="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-5"
        >
          <BaseSetting />
        </div>
        <div
          class="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-5"
        >
          <SecuritySetting />
        </div>
        <div
          class="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-5"
        >
          <OnlineDevice />
        </div>
      </div>
    </div>
  </Page>
</template>
