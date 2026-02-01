import BaseService from '@/app/api/core/base';
import { getApiBaseUrl } from '@/app/api/request';
import { useUserStore } from '@/store/modules/user';
import request from '@/utils/http';


const baseUrl = '/terminal'

export const TerminalService = {
    /**
     * Web终端请求
     */
    command(commandKey: string, uuid: string, extend: string) {
        const accessStore = useUserStore();
        const token = TerminalService.formatToken(accessStore.accessToken);
        return (
            getApiBaseUrl() + baseUrl + '?command=' + commandKey + '&uuid=' + uuid + '&extend=' + extend + '&token=' + token + '&server=crmd'
        )
    },

    /**
     * 配置更新
     * @param data 
     * @returns 
     */
    config(params: Partial<any>) {
        return request.put({ url: `${baseUrl}/config`, params });
    },


    /**
     * token 格式
     * @param token 
     * @returns 
     */
    formatToken(token: null | string) {
        return token ? `Bearer ${token}` : null;
    }
}


export type * from './model';