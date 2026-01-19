import BaseService from '@/app/api/core/base';
import request from '@/utils/http';

const baseUrl = '/system/auth';

export const AuthService = {
    ...BaseService<any>({ baseUrl }),

    getPublicKey() {
        return request.get({ url: `${baseUrl}/public-key` });
    },

    login(params: any) {
        return request.post({ url: '/system/login', params });
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
        return request.get({ url: `${baseUrl}/user-permissions`, params: { format: 'art' } });
    },
    getUserMenus() {
        return request.get({ url: `${baseUrl}/user-menus` });
    }

};

export default AuthService;
