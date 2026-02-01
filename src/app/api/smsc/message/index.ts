import BaseService from '@/app/api/core/base';
import type { MessageRow } from "./model";
import request from '@/utils/http';

const baseUrl = '/system/message';

export const MessageService = {
    ...BaseService<MessageRow>({ baseUrl }),

    updateRead(params: string | string[]) {
        const data = {
            id: params,
            status: 'read',
        };
        return request.put({ url: `${baseUrl}/${params}/update-read`, data });
    },

    emptyMessage(params: string | string[]) {
        const data = {
            id: params,
            status: 'deleted',
        };
        return request.put({ url: `${baseUrl}/empty`, data });
    },

    notifyOnFirstLoginToAll(data: any) {
        return request.post({ url: `${baseUrl}/notify-on-first-login-to-all`, data });
    },
};

export type * from './model';
export default MessageService;
