import request from '@/utils/http';
import type { UpdateAvatarParam, UpdatePasswordParam, UpdateUserInfoParam, UserSession } from './model';

const baseUrl = '/system/profile';

export const ProfileService = {
  updateAvatar(data: UpdateAvatarParam) {
    return request.put({ url: `${baseUrl}/update-avatar`, data });
  },

  updateInfo(data: UpdateUserInfoParam) {
    return request.put({ url: `${baseUrl}/update-info`, data });
  },

  updatePwd(data: UpdatePasswordParam) {
    return request.put({ url: `${baseUrl}/update-pwd`, data });
  },

  onlineDevice(params?: Record<string, any>): Promise<UserSession> {
    return request.get({ url: `${baseUrl}/online-device`, params });
  },

  kickoutByTokenValue(id: string | number, data?: Record<string, any>): Promise<any> {
    return request.del({ url: `${baseUrl}/kickout-by-token-value/${id}`, data });
  },
};

export default ProfileService;
