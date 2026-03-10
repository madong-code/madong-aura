import BaseService from '@/api/core/base';
import request from '@/utils/http';

const baseUrl = '/member/auth';

export const AuthService = {
    ...BaseService<any>({ baseUrl }),
    tagMenuIds(params: any) {
        return request.get({ url: `${baseUrl}/tag-menu-ids`, params });
    },

    tagScopeIds(params: any) {
        return request.get({ url: `${baseUrl}/tag-scope-ids`, params });
    },

    userListByTagId(params: any) {
        return request.get({ url: `${baseUrl}/user-list-by-tag-id`, params });
    },

    userListExcludeTagId(params: any) {
        return request.get({ url: `${baseUrl}/user-list-exclude-tag-id`, params });
    },

    removeUserTag(data: any) {
        return request.post({ url: `${baseUrl}/remove-user-tag`, data });
    },

    saveTagMenu(data: any) {
        return request.post({ url: `${baseUrl}/save-tag-menu`, data });
    },

    saveUserTag(data: any) {
        return request.post({ url: `${baseUrl}/save-user-tag`, data });
    },

    getMemberAllPermission() {
        return request.get({ url: `${baseUrl}/permissions`, params: {} });
    },

    getMemberPermissionByTagId(id: number | string, params: any) {
        return request.get({ url: `${baseUrl}/${id}/tag-permissions`, params: { format: 'tree' } });
    },

};

export default AuthService;
