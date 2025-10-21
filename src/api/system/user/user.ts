import BaseService from '@/api/core/base';
import request from '@/utils/http';
import type { User } from './user-model';

/**
 * 公共接口
 */
const baseUrl = '/system/user';

export const UserService = {
  ...BaseService<User>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: ['export'],
  }),

  resetPassword(data: Record<string, any>): Promise<User[]> {
    return request.put({ url: `${baseUrl}/reset-password`, data });
  },

  playUser(data: Record<string, any>) {
    return request.put({ url: `${baseUrl}/play-user`, data });
  },

  unPlayUser(data: any) {
    return request.put({ url: `${baseUrl}/unplay-user`, data });
  },

  grantRole(data: any) {
    return request.put({ url: `${baseUrl}/grant-role`, data });
  },

  locked(data: any) {
    return request.put({ url: `${baseUrl}/locked`, data });
  },

  unLocked(data: any) {
    return request.put({ url: `${baseUrl}/un-locked`, data });
  },

  preferences(data: any) {
    return request.put({ url: `${baseUrl}/preferences`, data });
  },

  getUserInfo() {
    return request.get({ url: `/system/auth/user-info` });
  },

  getPermCode() {
    return request.get({ url: `/system/auth/perm-code` });
  },

};

export default UserService;
