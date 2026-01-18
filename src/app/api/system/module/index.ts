import BaseService from "@/api/core/base";
import type { ModuleRow } from "./model";
import request from '@/utils/http';

const baseUrl = '/modules';

export const ModulesService = {

    async list(params?: Record<string, any>): Promise<ModuleRow[]> {
        return request.get<ModuleRow[]>({
            url: baseUrl,
            params,
        })
    },

    async get(name: string | number): Promise<ModuleRow> {
        return request.get<ModuleRow>({
            url: `${baseUrl}/${name}`,
        })
    },

    async upload(file: File): Promise<ModuleRow> {
        return request.post<ModuleRow>({
            url: `${baseUrl}/upload`,
            data: file,
        })
    },

    async install(data: any): Promise<ModuleRow> {
        return request.post<ModuleRow>({
            url: `${baseUrl}/install`,
            data,
        })
    },
    async uninstall(name: string | number): Promise<ModuleRow> {
        return request.del<ModuleRow>({
            url: `${baseUrl}/${name}/uninstall`,
        })
    },
};

export type * from './model';
export default ModulesService;
