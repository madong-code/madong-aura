import type {
  MessageItem,
  MessageListResponse,
  UnreadCountData,
} from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/content/message/notify';

export const NotifyService = {
  getList(params: any): Promise<MessageListResponse> {
    return requestClient.get(`${baseUrl}`, { params });
  },

  getDetail(id: number | string): Promise<MessageItem> {
    return requestClient.get(`${baseUrl}/${id}`);
  },

  markRead(id: number | string): Promise<any> {
    return requestClient.put(`${baseUrl}/${id}/read`);
  },

  batchMarkRead(ids: (number | string)[]): Promise<any> {
    return requestClient.put(`${baseUrl}/batch-read`, { ids });
  },

  markAllRead(): Promise<any> {
    return requestClient.put(`${baseUrl}/read-all`);
  },

  delete(id: number | string): Promise<any> {
    return requestClient.delete(`${baseUrl}/${id}`);
  },

  batchDelete(ids: (number | string)[]): Promise<any> {
    return requestClient.delete(`${baseUrl}/batch-delete`, { data: { ids } });
  },

  getUnreadCount(): Promise<UnreadCountData> {
    return requestClient.get(`${baseUrl}/unread-count`);
  },
};
