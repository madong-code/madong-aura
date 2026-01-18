
import BaseService from "@/api/core/base";
import type { GatewayLimiterRow, GatewayBlacklistRow } from "./model";


const baseUrl = '/dev/limiter'

export const GatewayLimiterService = {
    ...BaseService<GatewayLimiterRow>({ baseUrl })
}


export const GatewayBlacklistService = {
    ...BaseService<GatewayBlacklistRow>({ baseUrl: '/dev/blacklist' })
}


export type * from './model';

