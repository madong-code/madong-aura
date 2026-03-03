
import BaseService from "@/api/core/base";
import type { GatewayLimiterRow, GatewayBlacklistRow } from "./model";


const baseUrl = '/gateway/limiter'

export const GatewayLimiterService = {
    ...BaseService<GatewayLimiterRow>({ baseUrl })
}


export const GatewayBlacklistService = {
    ...BaseService<GatewayBlacklistRow>({ baseUrl: '/gateway/blacklist' })
}


export type * from './model';

