import type {
  ApplicationConfig,
  VbenAdminProAppConfigRaw,
} from '#/core/shared/types/global';

/**
 * 由 vite-inject-app-config 注入的全局配置
 */
export function useAppConfig(
  env: Record<string, any>,
  isProduction: boolean,
): ApplicationConfig {
  // 生产环境下，直接使用 window._VBEN_ADMIN_PRO_APP_CONF_ 全局变量
  const config = isProduction
    ? window._VBEN_ADMIN_PRO_APP_CONF_
    : (env as VbenAdminProAppConfigRaw);

  const {
    VITE_GLOB_API_URL,
    VITE_GLOB_AUTH_DINGDING_CORP_ID,
    VITE_GLOB_AUTH_DINGDING_CLIENT_ID,
    VITE_GLOB_TENANT_MODE,
  } = config;

  // 租户运行模式：auto（默认探测后端）/ standard（强制标准，不请求租户接口）
  // / saas（强制多租户，不请求租户接口）。非法值回退 auto。
  const mode = VITE_GLOB_TENANT_MODE as ApplicationConfig['tenantMode'];
  const tenantMode: ApplicationConfig['tenantMode'] =
    mode === 'standard' || mode === 'saas' || mode === 'auto' ? mode : 'auto';

  const applicationConfig: ApplicationConfig = {
    apiURL: VITE_GLOB_API_URL,
    auth: {},
    tenantMode,
  };
  if (VITE_GLOB_AUTH_DINGDING_CORP_ID && VITE_GLOB_AUTH_DINGDING_CLIENT_ID) {
    applicationConfig.auth.dingding = {
      clientId: VITE_GLOB_AUTH_DINGDING_CLIENT_ID,
      corpId: VITE_GLOB_AUTH_DINGDING_CORP_ID,
    };
  }

  return applicationConfig;
}
