import request from '@/utils/http';
import type { UpdateAvatarParam, UpdatePasswordParam, UpdateUserInfoParam, UserSession } from './types';

/**
 * 个人中心 API 服务
 * 符合 RESTful API 规范
 */
const BASE_URL = '/profile';

export const ProfileService = {
  /**
   * 获取当前用户信息
   * @returns {Promise<any>} 用户信息
   */
  getProfile() {
    return request.get({ url: BASE_URL });
  },

  /**
   * 更新个人信息
   * @param {UpdateUserInfoParam} data - 个人信息数据
   * @returns {Promise<any>} 更新结果
   */
  updateProfile(data: UpdateUserInfoParam) {
    return request.put({ url: BASE_URL, data });
  },

  /**
   * 更新头像
   * @param {UpdateAvatarParam} data - 头像数据
   * @returns {Promise<any>} 更新结果
   */
  updateAvatar(data: UpdateAvatarParam) {
    return request.put({ url: `${BASE_URL}/avatar`, data });
  },

  /**
   * 修改密码
   * @param {UpdatePasswordParam} data - 密码数据
   * @returns {Promise<any>} 更新结果
   */
  updatePassword(data: UpdatePasswordParam) {
    return request.put({ url: `${BASE_URL}/password`, data });
  },

  /**
   * 获取在线设备列表
   * @param {Record<string, any>} params - 查询参数
   * @returns {Promise<UserSession>} 在线设备列表
   */
  getOnlineDevices(params?: Record<string, any>): Promise<UserSession> {
    return request.get({ url: `${BASE_URL}/sessions`, params });
  },

  /**
   * 强制下线指定设备
   * @param {string | number} id - 会话ID
   * @param {Record<string, any>} data - 额外数据
   * @returns {Promise<any>} 操作结果
   */
  kickoutSession(id: string | number, data?: Record<string, any>): Promise<any> {
    return request.del({ url: `${BASE_URL}/sessions/${id}`, data });
  },

  /**
   * 更新用户偏好设置
   * @param {Record<string, any>} preferences - 偏好设置
   * @returns {Promise<any>} 更新结果
   */
  updatePreferences(preferences: Record<string, any>) {
    return request.put({ url: `${BASE_URL}/update-preferences`, data: { preferences } });
  },
};

export default ProfileService;
