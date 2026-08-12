import type {
  UpdatePasswordParam,
  UpdateUserInfoParam,
  UserSession,
} from './types';

import { requestClient } from '#/api/request';

const BASE_URL = '/auth/profile';

export const ProfileService = {
  getProfile() {
    return requestClient.get(BASE_URL);
  },

  updateProfile(data: UpdateUserInfoParam) {
    return requestClient.put(BASE_URL, data);
  },

  updateAvatar(data: { avatar: string }) {
    return requestClient.put(BASE_URL, data);
  },

  /**
   * 上传头像文件到专用端点，后端自动保存到 avatar/ 目录并更新用户头像
   * @param file 头像 File 对象
   * @returns Promise<{ avatar: string }>
   */
  uploadAvatarFile(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return requestClient.put(`${BASE_URL}/avatar`, formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  updatePassword(data: UpdatePasswordParam) {
    return requestClient.put(`${BASE_URL}/password`, data);
  },

  getOnlineDevices(params?: Record<string, any>): Promise<UserSession> {
    return requestClient.get(`${BASE_URL}/sessions`, { params });
  },

  kickoutSession(
    id: number | string,
    data?: Record<string, any>,
  ): Promise<any> {
    return requestClient.delete(`${BASE_URL}/sessions/${id}`, { data });
  },

  updatePreferences(preferences: Record<string, any>) {
    return requestClient.put(`${BASE_URL}/update-preferences`, { preferences });
  },
};
