import BaseService from "@/api/core/base";
import type { NoticeRow } from "./types";
import request from '@/utils/http';

const baseUrl = '/notice';

export const NoticeService = {
    ...BaseService<NoticeRow>({ baseUrl }),

    publish(data: any) {
        return request.post({ url: `${baseUrl}/publish`, data });
    },
};

export type * from './types';
export default NoticeService;
