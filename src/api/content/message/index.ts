import type { MessageRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/content/message';

export const MessageService = {
  ...BaseService<MessageRow>({ baseUrl }),

  updateRead(params: string | string[]) {
    const data = { id: params, status: 'read' };
    return requestClient.put(`${baseUrl}/${params}/update-read`, data);
  },

  emptyMessage(params: string | string[]) {
    const data = { id: params, status: 'deleted' };
    return requestClient.put(`${baseUrl}/empty`, data);
  },

  notifyOnFirstLoginToAll(data: any) {
    return requestClient.post(`${baseUrl}/notify-on-first-login-to-all`, data);
  },
};
