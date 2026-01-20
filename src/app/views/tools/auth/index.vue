<template>
  <div class="auth-content">
    <el-card>
      <div class="title text-base font-bold text-gray-900 mb-8">
        {{ $t("tools.auth.title") }}
      </div>
      <div class="flex items-center">
        <div class="w-24 h-24 rounded-lg flex justify-center items-center mr-5">
          <img src="@/app/assets/images/tools/auth.png" class="w-24 h-24" />
        </div>
        <div class="flex flex-col justify-between font-medium">
          <div class="flex flex-wrap items-center mb-3">
            <span class="mr-1.5 text-sm text-gray-600 w-25 text-left"
              >{{ $t("tools.auth.company") }}：</span
            >
            <span class="text-sm text-gray-800">{{ authInfo.company_name || "--" }}</span>
          </div>
          <div class="flex flex-wrap items-center mb-3">
            <span class="mr-1.5 text-sm text-gray-600 w-25 text-left"
              >{{ $t("tools.auth.domain") }}：</span
            >
            <span class="text-sm text-gray-800">{{ authInfo.domain || "--" }}</span>
          </div>
          <div class="flex flex-wrap items-center">
            <span class="mr-1.5 text-sm text-gray-600 w-25 text-left"
              >{{ $t("tools.auth.auth_code") }}：</span
            >
            <span class="text-sm text-gray-800">
              <span class="mr-2.5">{{
                authInfo.auth_code
                  ? isCodeVisible
                    ? authInfo.auth_code
                    : hideAuthCode(authInfo.auth_code)
                  : "--"
              }}</span>
              <el-icon
                v-if="!isCodeVisible"
                @click="toggleCodeVisibility"
                class="text-sm cursor-pointer text-gray-500"
              >
                <View />
              </el-icon>
              <el-icon
                v-else
                @click="toggleCodeVisibility"
                class="text-sm cursor-pointer text-gray-500"
              >
                <Hide />
              </el-icon>
            </span>
          </div>
        </div>
      </div>

      <div class="mt-4 ml-28">
        <el-button
          class="w-35 h-8 mt-2 rounded"
          type="primary"
          @click="handleAuthDialogOpen"
          >{{ $t("tools.auth.auth_button") }}</el-button
        >
        <el-popover
          ref="permissionCodePopoverRef"
          placement="bottom-start"
          :width="478"
          trigger="click"
          class="mt-2"
        >
          <div class="px-4 py-2">
            <p class="leading-8 text-sm">{{ $t("tools.auth.get_from_website") }}</p>
            <div class="flex justify-end mt-9">
              <el-button class="w-45 h-12" @click="handleNavigateToMarket">{{
                $t("tools.auth.go_to_market")
              }}</el-button>
              <el-button class="w-25 h-12" @click="handlePermissionCodeClose">{{
                $t("tools.auth.close")
              }}</el-button>
            </div>
          </div>
          <template #reference>
            <el-button
              class="w-35 h-8 mt-2 rounded text-primary hover:text-primary bg-transparent"
              >{{ $t("tools.auth.how_to_get") }}</el-button
            >
          </template>
        </el-popover>
      </div>
    </el-card>
    <AuthDialog ref="authDialogRef" />
  </div>
</template>

<script lang="ts" setup>
import { type AuthInfo, ToolsAuthService } from "@/app/api/tools/auth";
import AuthDialog from "@/app/views/tools/auth/authorization.vue";


const permissionCodePopoverRef = ref();
const authDialogRef = ref<typeof AuthDialog>();

const authInfo = ref<AuthInfo>({
  company_name: "",
  domain: "",
  auth_code: "",
});

const isCodeVisible = ref(false);

const handleAuthDialogOpen = () => {
  authDialogRef.value?.openDialog();
};

const toggleCodeVisibility = () => {
  isCodeVisible.value = !isCodeVisible.value;
};

const hideAuthCode = (code: string) => {
  if (!code) return "--";
  return code.replace(/.(?=.{4})/g, "*");
};

const handleNavigateToMarket = () => {
  window.open("https://www.madong.tech/apps");
};

const handlePermissionCodeClose = () => {
  permissionCodePopoverRef.value?.hide();
};

onMounted(async () => {
  const data = await ToolsAuthService.getAuthInfo();
  authInfo.value = data || {};
});
</script>
