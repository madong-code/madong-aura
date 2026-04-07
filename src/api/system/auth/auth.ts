import BaseService from '@/api/core/base';
import request from '@/utils/http';
import axios from 'axios';

const { VITE_API_URL } = import.meta.env

const baseUrl = '/system/auth';

// 独立的 axios 实例用于刷新 token，避免与主请求拦截器关联
const refreshAxios = axios.create({
    baseURL: VITE_API_URL,
    timeout: 10000,
});

/**
 * 使用 refresh token 刷新 access token（独立实例）
 * @param refreshToken - refresh token
 */
export function refreshAccessTokenByRefreshToken(refreshToken: string) {
    return refreshAxios.post(`${baseUrl}/refresh-token`, {}, {
        headers: {
            Authorization: `Bearer ${refreshToken}`
        }
    });
}

export const AuthService = {
    ...BaseService<any>({ baseUrl }),

    getPublicKey() {
        return request.get({ url: `/login/auth/public-key` });
    },

    login(params: any) {
        return request.post({ url: '/login/login', params });
    },

    logout(params: any) {
        return request.post({ url: '/login/logout', params });
    },

    userInfo() {
        return request.get({ url: `${baseUrl}/user-info` });
    },

    roleMenuIds(params: any) {
        return request.get({ url: `${baseUrl}/role-menu-ids`, params });
    },

    roleScopeIds(params: any) {
        return request.get({ url: `${baseUrl}/role-scope-ids`, params });
    },

    userListByRoleId(params: any) {
        return request.get({ url: `${baseUrl}/user-list-by-role-id`, params });
    },

    userListExcludeRoleId(params: any) {
        return request.get({ url: `${baseUrl}/user-list-exclude-role-id`, params });
    },

    removeUserRole(data: any) {
        return request.post({ url: `${baseUrl}/remove-user-role`, data });
    },

    saveRoleMenu(data: any) {
        return request.post({ url: `${baseUrl}/save-role-menu`, data });
    },

    saveUserRole(data: any) {
        return request.post({ url: `${baseUrl}/save-user-role`, data });
    },

    getUserTenant() {
        return request.get({ url: `${baseUrl}/user-tenant` });
    },

    changeTenant(data: any) {
        return request.put({ url: `${baseUrl}/change-tenant`, data });
    },

    tenantGrant(data: any) {
        return request.put({ url: `${baseUrl}/tenant-grant`, data });
    },

    getUserPermission() {
        return request.get({ url: `${baseUrl}/user-permissions`, params: {} });
    },
    fetchGetMenuList() {
        // 获取用户菜单列表-返回前端路由格式
        return request.get({ url: `${baseUrl}/user-menus`, params: { format: 'art' } });
    },

    getCaptcha() {
        return request.get({ url: `/login/captcha` });
    },

    //刷新token
    refreshAccessToken(refreshToken: string) {
        return refreshAccessTokenByRefreshToken(refreshToken);
    }

};

export default AuthService;
