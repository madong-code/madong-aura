import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    user_name?: string;
    password?: string;
    mobile_phone?: string;
    code?: string;
    uuid?: string;
    type?: string;
    grant_type?: string;
    key_id?: string;
    tenant_id?: number | string;
    /** 租户代码（与 tenant_id 二选一，多租户登录） */
    tenant_code?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    client_id: string;
    expires_time: number;
    /** 登录/切换后当前租户信息（多租户模式） */
    tenant?: {
      code: string;
      database_mode: string;
      id: number | string;
      name: string;
    };
  }

  export interface RefreshTokenResult {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
  }

  /** 租户模式状态 */
  export interface TenantModeFlag {
    enabled: boolean;
    auto_select_first: boolean;
  }

  /** 租户选项 */
  export interface TenantOption {
    id: number | string;
    name: string;
    code: string;
    domain: string;
    database_mode: string;
    database_name: string;
    is_default?: boolean;
  }

  /** 租户分页结果 */
  export interface TenantPageResult {
    list: AuthApi.TenantOption[];
    total: number;
  }
}

export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/** 租户模式探测：标准后端无该接口，静默失败并返回关闭状态 */
export async function getTenantModeFlagApi() {
  return requestClient
    .get<AuthApi.TenantModeFlag>('/auth/tenant-mode', {
      skipGlobalErrorHandler: true,
    })
    .catch(() => ({ enabled: false, auto_select_first: false }));
}

/** 分页搜索租户（供租户搜索器使用） */
export async function getTenantPageApi(params: {
  keyword?: string;
  page?: number;
  page_size?: number;
} = {}) {
  return requestClient.get<AuthApi.TenantPageResult>('/auth/tenants', {
    params,
  });
}

/** 当前登录用户的租户列表（已登录切换用） */
export async function getUserTenantListApi() {
  return requestClient.get<AuthApi.TenantOption[]>('/system/auth/tenant-list');
}

/** 切换当前登录用户的租户 */
export async function switchTenantApi(tenantId: number | string) {
  return requestClient.post<AuthApi.LoginResult>('/system/auth/switch-tenant', {
    tenant_id: tenantId,
  });
}

/**
 * 获取站点信息（登录前匿名可访问）
 * 两端同名：SaaS 取平台分组，标准版取 default 分组的 site_setting。
 * 带 skipGlobalErrorHandler：个别后端缺该接口时静默失败，由调用方沿用默认品牌。
 */
export async function getSiteInfoApi() {
  return requestClient.get('/auth/site-info', {
    skipGlobalErrorHandler: true,
  });
}

export async function logoutApi() {
  return requestClient.post('/auth/logout');
}
