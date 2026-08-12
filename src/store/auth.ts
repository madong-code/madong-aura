import type { Recordable } from '#/core/shared/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { defineStore } from 'pinia';

import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { preferences } from '#/core/preferences';
import { LOGIN_PATH } from '#/core/shared/constants';
import { resetAllStores, useAccessStore, useUserStore } from '#/core/stores';
import { useSiteConfigStore } from '#/store/modules/site-config';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    try {
      loginLoading.value = true;
      const loginResult = await loginApi(params);
      const { access_token: accessToken, refresh_token: refreshToken } =
        loginResult;

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 和 refreshToken 存储到 accessStore 中
        accessStore.setAccessToken(accessToken);
        accessStore.setRefreshToken(refreshToken);

        // 登录成功后立即预加载权限码，确保路由渲染（权限判断钩子）前权限码已就绪。
        // 避免「刚登录时按钮缺失、刷新后正常」的时序竞态；失败不阻塞登录，由路由守卫补偿。
        try {
          const accessCodes = await getAccessCodesApi();
          accessStore.setAccessCodes(accessCodes);
        } catch {
          // 预加载失败由 setupAccessGuard 补偿加载
        }

        // 登录成功后同步站点配置到 preferences（logo/标题/favicon）。
        // 与登录页共用 GET /system/config/code/site_setting，保证登录前后展示一致。
        // 内部已做异常保护，不会阻塞登录流程。
        await useSiteConfigStore().syncSitePreferences();

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(preferences.app.defaultHomePath);
        }
      }
    } finally {
      loginLoading.value = false;
    }
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }

    // 1. 重置所有 store（access/user/siteConfig/tabbar...），siteConfig.$reset 已包含重置
    resetAllStores();

    // 2. 强制清除 token 并写入 storage，防止 pinia-plugin-persistedstate 在 $reset 后恢复旧 token
    accessStore.$patch({
      accessToken: null,
      refreshToken: null,
    });

    // 3. 回登录页（路由守卫检测 accessToken 为空 → 放行）
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
