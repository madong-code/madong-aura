<script setup lang="ts">
import { computed } from 'vue';

import { ElTag } from 'element-plus';

import Avatar from '#/components/form/components/avatar/index.vue';
import { Icon } from '#/components/icon';
import { useUserStore } from '#/core/stores';
import { $t } from '#/locales';
import { formatDate } from '#/utils';

const emit = defineEmits<{
  avatarSuccess: [url: string];
}>();

const userStore = useUserStore();

const userInfo = computed(
  () => (userStore.userInfo ?? {}) as Record<string, any>,
);

const avatarUrl = computed(() => (userInfo.value?.avatar as string) || '');

function formatDepts(depts: any[] | undefined): string {
  if (!depts || depts.length === 0) return '—';
  return depts.map((d: any) => d.name).join('，');
}

const sexLabel = computed(() => {
  const s = userInfo.value?.sex;
  if (s === 1)
    return {
      icon: 'ant-design:man-outlined',
      color: '#409EFF',
      label: $t('system.profile.card.male'),
    };
  if (s === 2)
    return {
      icon: 'ant-design:woman-outlined',
      color: '#F56C6C',
      label: $t('system.profile.card.female'),
    };
  return null;
});

function formatTime(val: null | number | string | undefined): string {
  if (!val) return '';
  const timestamp = typeof val === 'number' && val < 1e12 ? val * 1000 : val;
  return formatDate(timestamp) || '';
}

function handleAvatarSuccess(newUrl: string) {
  emit('avatarSuccess', newUrl);
}
</script>

<template>
  <div class="w-[448px] max-md:w-full">
    <div
      class="relative rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden"
    >
      <div class="relative h-[200px] rounded-t-xl overflow-hidden">
        <div class="absolute inset-0 bg-header"></div>
      </div>

      <div class="relative -mt-10 p-5 text-center">
        <div class="flex justify-center">
          <div class="border-2 border-white rounded-full overflow-hidden">
            <Avatar
              :model-value="avatarUrl"
              shape="circle"
              class="avatar-upload cursor-pointer"
              @success="handleAvatarSuccess"
            />
          </div>
        </div>

        <h2 class="mt-4 text-xl font-normal text-gray-800 dark:text-gray-100">
          {{
            userInfo?.real_name ||
            userInfo?.realName ||
            userInfo?.username ||
            ''
          }}
          <Icon
            v-if="sexLabel"
            :icon="sexLabel.icon"
            class="ml-1 text-sm"
            :style="{ color: sexLabel.color }"
          />
          <span v-if="sexLabel" class="ml-0.5 text-sm">{{
            sexLabel.label
          }}</span>
        </h2>
        <p class="mt-1 text-sm text-gray-400">
          @{{ userInfo?.user_name || userInfo?.username || '' }}
          <template v-if="userInfo?.nick_name">
            <span class="mx-1 text-gray-300">·</span>
            <span>{{ userInfo.nick_name }}</span>
          </template>
        </p>
        <p class="mt-4 text-sm text-gray-400">
          {{ userInfo?.signed || $t('system.profile.card.signed_placeholder') }}
        </p>

        <div class="w-[300px] mx-auto mt-7 text-left space-y-3">
          <div class="flex items-center">
            <Icon
              icon="ant-design:mail-outlined"
              class="text-gray-400 shrink-0 text-base"
            />
            <span
              class="ml-2.5 text-sm text-gray-600 dark:text-gray-300 truncate"
              >{{ userInfo?.email || $t('system.profile.card.not_set') }}</span
            >
          </div>
          <div class="flex items-center">
            <Icon
              icon="ant-design:phone-outlined"
              class="text-gray-400 shrink-0 text-base"
            />
            <span class="ml-2.5 text-sm text-gray-600 dark:text-gray-300">{{
              userInfo?.mobile_phone || $t('system.profile.card.not_set')
            }}</span>
          </div>
          <div v-if="userInfo?.address" class="flex items-start">
            <Icon
              icon="ant-design:environment-outlined"
              class="mt-0.5 text-gray-400 shrink-0 text-base"
            />
            <span class="ml-2.5 text-sm text-gray-600 dark:text-gray-300">{{
              userInfo.address
            }}</span>
          </div>
          <div class="flex items-center">
            <Icon
              icon="ant-design:cluster-outlined"
              class="text-gray-400 shrink-0 text-base"
            />
            <span class="ml-2.5 text-sm text-gray-600 dark:text-gray-300">{{
              formatDepts(userInfo?.depts)
            }}</span>
          </div>
          <div class="flex items-start">
            <Icon
              icon="ant-design:safety-certificate-outlined"
              class="mt-0.5 text-gray-400 shrink-0 text-base"
            />
            <div class="ml-2.5 flex flex-wrap gap-1">
              <ElTag
                v-for="role in userInfo?.roles || []"
                :key="role.id"
                size="small"
                effect="plain"
              >
                {{ role.name }}
              </ElTag>
              <span
                v-if="!userInfo?.roles?.length"
                class="text-sm text-gray-400"
                >—</span
              >
            </div>
          </div>
          <div class="flex items-center">
            <Icon
              icon="ant-design:clock-circle-outlined"
              class="text-gray-400 shrink-0 text-base"
            />
            <span class="ml-2.5 text-sm text-gray-600 dark:text-gray-300"
              >{{ $t('system.profile.card.create_time') }}:
              {{
                formatTime(userInfo?.create_time || userInfo?.created_at) ||
                $t('system.profile.card.unknown')
              }}</span
            >
          </div>
          <div class="flex items-center">
            <Icon
              icon="ant-design:login-outlined"
              class="text-gray-400 shrink-0 text-base"
            />
            <span class="ml-2.5 text-sm text-gray-600 dark:text-gray-300"
              >{{ $t('system.profile.card.last_login') }}:
              {{
                formatTime(userInfo?.last_login_time || userInfo?.login_time) ||
                $t('system.profile.card.unknown')
              }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-header {
  background-color: hsl(var(--primary));
  background-image:
    linear-gradient(
      135deg,
      hsl(var(--primary) / 85%) 0%,
      hsl(var(--primary) / 40%) 100%
    ),
    radial-gradient(
      circle at 20% 80%,
      rgb(255 255 255 / 10%) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgb(255 255 255 / 8%) 0%,
      transparent 35%
    ),
    repeating-linear-gradient(
      45deg,
      transparent 0,
      transparent 10px,
      rgb(255 255 255 / 3%) 10px,
      rgb(255 255 255 / 3%) 11px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent 0,
      transparent 10px,
      rgb(255 255 255 / 3%) 10px,
      rgb(255 255 255 / 3%) 11px
    );
}

.avatar-upload {
  cursor: pointer;
}

:deep(.avatar-upload .el-upload--picture-card) {
  width: 80px;
  height: 80px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  border-radius: 50%;
}
</style>
