import type { LoginRecordRow, OperateRecordRow } from './types';

import BaseService from '#/api/core/base';

const loginBaseUrl = '/ops/login-log';
const operateBaseUrl = '/ops/operate-log';

export const LoginLogService = {
  ...BaseService<LoginRecordRow>({
    baseUrl: loginBaseUrl,
    allowedMethods: ['list', 'get', 'remove'],
  }),
};

export const OperateLogService = {
  ...BaseService<OperateRecordRow>({
    baseUrl: operateBaseUrl,
    allowedMethods: ['list', 'get', 'remove'],
  }),
};
