import type { GatewayBlacklistRow, GatewayLimiterRow } from './types';

import BaseService from '#/api/core/base';

export const GatewayLimiterService = {
  ...BaseService<GatewayLimiterRow>({ baseUrl: '/ops/rate-limiter' }),
};

export const GatewayBlacklistService = {
  ...BaseService<GatewayBlacklistRow>({ baseUrl: '/ops/rate-restrictions' }),
};
