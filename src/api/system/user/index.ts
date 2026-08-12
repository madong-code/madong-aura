import type { User } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/admin';

export const UserService = {
  ...BaseService<User>({
    baseUrl,
    forbiddenMethods: ['export'],
  }),

  resetPassword(data: Record<string, any>): Promise<User[]> {
    return requestClient.put(`${baseUrl}/reset-password`, data);
  },

  playUser(data: Record<string, any>) {
    return requestClient.put(`${baseUrl}/play-user`, data);
  },

  unPlayUser(data: any) {
    return requestClient.put(`${baseUrl}/unplay-user`, data);
  },

  grantRole(data: any) {
    return requestClient.post(`${baseUrl}/grant-role`, data);
  },

  locked(data: any) {
    return requestClient.put(`${baseUrl}/locked`, data);
  },

  unLocked(data: any) {
    return requestClient.put(`${baseUrl}/un-locked`, data);
  },

  preferences(data: any) {
    return requestClient.put(`${baseUrl}/preferences`, data);
  },

  getUserInfo() {
    return requestClient.get('/system/auth/user-info');
  },

  getPermCode() {
    return requestClient.get('/system/auth/perm-code');
  },
};
