import BaseService from '@/api/core/base';
import request from '@/utils/http';

const baseUrl = '/terminal'

export const TerminalService = {
    /**
     * 获取终端配置
     */
    getConfig() {
        return request.get({ url: `${baseUrl}/config` });
    },

    /**
     * 获取命令列表（带分组）
     */
    getCommands() {
        return request.get({ url: `${baseUrl}/commands` });
    },

    /**
     * Web终端请求
     */
    command(commandKey: string, uuid: string, extend: string, eventHandlers: any) {
        return request.sse({
            url: baseUrl,
            params: {
                command: commandKey,
                uuid: uuid,
                extend: extend,
                server: 'crmd'
            }
        }, eventHandlers);
    },

    /**
     * 配置更新
     * @param data 
     * @returns 
     */
    updateConfig(data: Partial<any>) {
        return request.post({ url: `${baseUrl}/config`, data });
    }
}


export type * from './types';