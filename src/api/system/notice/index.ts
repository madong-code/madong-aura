import BaseService from "@/api/core/base";
import type { NoticeRow } from "./model";
import request from '@/utils/http';

const baseUrl = '/system/notice';

export const NoticeService = {
    ...BaseService<NoticeRow>({ baseUrl }),

    publish(data: any) {
        return request.put({ url: `${baseUrl}/publish`, data });
    },
};

export type * from './model';
export default NoticeService;
