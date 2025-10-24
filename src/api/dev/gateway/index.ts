
import BaseService from "@/api/core/base";
import type { GatewayLimiterRow, GatewayBlacklistRow } from "./model";


const baseUrl = '/dev/gateway/limiter'

export const GatewayLimiterService = {
    ...BaseService<GatewayLimiterRow>({ baseUrl })
}


export const GatewayBlacklist = {
    ...BaseService<GatewayBlacklistRow>({ baseUrl })
}


export type * from './model';

