import type { AuthApi } from '#/api';
import type { Recordable } from '#/core/shared/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getUserInfoApi,
  getUserTenantListApi,
  loginApi,
  logoutApi,
  switchTenantApi,
} from '#/api';
import { preferences } from '#/core/preferences';
import { LOGIN_PATH } from '#/core/shared/constants';
import { resetAllStores, useAccessStore, useUserStore } from '#/core/stores';
import { useUserStore as useAppUserStore } from '#/store/modules/user';
import { useSiteConfigStore } from '#/store/modules/site-config';
import { buildAppUrl } from '#/utils/url';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  /** 当前用户的租户列表（多租户模式，供切换弹窗使用） */
  const tenantList = ref<AuthApi.TenantOption[]>([]);
  const tenantListLoading = ref(false);

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

        // 多租户：存储登录响应中的租户ID。标准后端不返回 tenant 字段 → 不设置 →
        // tenantId 保持 null → 请求层永不注入 X-Tenant-Id，标准版零感知。
        const tenantId = loginResult.tenant?.id ?? params.tenant_id;
        if (tenantId) {
          accessStore.setTenantId(tenantId);
        }

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

    // 1. 重置所有 store（access/user/siteConfig/tabbar...）
    resetAllStores();

    // 2. 强制清除 token 并写入 storage，防止 pinia-plugin-persistedstate 在 $reset 后恢复旧 token
    accessStore.$patch({
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      isAccessChecked: false,
      loginExpired: false,
    });

    // 3. 清除 localStorage 中的持久化数据，防止 persist 插件在导航守卫中恢复 token
    try {
      const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${import.meta.env.VITE_APP_VERSION}-${import.meta.env.PROD ? 'prod' : 'dev'}`;
      localStorage.removeItem(`${namespace}-core-access`);
    } catch {}

    // 3.1 容器侧 user store（art-design-pro 双 store 体系）持久化了 isLogin/accessToken。
    //     此处若不清，硬跳转重载后 isLogin=true 会被守卫当作已登录 → 用空 token
    //     注册动态路由 → 401 → next(false) → 登录页白屏。重置状态由 persist 插件写回。
    const appUserStore = useAppUserStore();
    appUserStore.setLoginStatus(false);
    appUserStore.setToken('', '');

    // 4. 构建登录页 URL，如有需要携带 redirect 参数
    const loginUrl = redirect
      ? `${LOGIN_PATH}?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`
      : LOGIN_PATH;

    // 5. 使用硬跳转确保一定到达登录页（绕过路由守卫和 persist 插件的竞态问题）
    //    必须经 buildAppUrl 拼上部署 base（如 /admin/），否则子目录部署会 404
    window.location.assign(buildAppUrl(loginUrl));
  }

  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /** 拉取当前用户的租户列表（多租户模式） */
  async function fetchTenantList() {
    tenantListLoading.value = true;
    try {
      tenantList.value = await getUserTenantListApi();
      return tenantList.value;
    } finally {
      tenantListLoading.value = false;
    }
  }

  /**
   * 切换当前租户（多租户模式）
   * 更新 token/租户上下文后，重新加载权限码、用户信息与站点品牌配置。
   * 标准后端不会调用到此方法。
   */
  async function switchTenant(tenantId: number | string) {
    const result = await switchTenantApi(tenantId);

    accessStore.setAccessToken(result.access_token);
    accessStore.setRefreshToken(result.refresh_token);
    accessStore.setTenantId(result.tenant?.id ?? tenantId);

    const [userInfo, accessCodes] = await Promise.all([
      getUserInfoApi(),
      getAccessCodesApi(),
    ]);
    if (result.tenant) {
      (userInfo as Record<string, any>).current_tenant = result.tenant;
    }
    userStore.setUserInfo(userInfo);
    accessStore.setAccessCodes(accessCodes);

    // 刷新站点品牌（内部已做异常保护）
    await useSiteConfigStore().syncSitePreferences();
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchTenantList,
    fetchUserInfo,
    loginLoading,
    logout,
    switchTenant,
    tenantList,
    tenantListLoading,
  };
});
