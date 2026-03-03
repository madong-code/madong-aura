import BaseService from '@/api/core/base';
import type { LoginRecordRow, OperateRecordRow } from './logs-model';

const loginBaseUrl = '/logs/login';
const operateBaseUrl = '/logs/operate';

export const LoginLogService = {
  ...BaseService<LoginRecordRow>({ baseUrl: loginBaseUrl, allowedMethods: ['list', 'get', 'remove'] }),
};

export const OperateLogService = {
  ...BaseService<OperateRecordRow>({ baseUrl: operateBaseUrl, allowedMethods: ['list', 'get', 'remove'] }),
};

export default {
  loginLogApi: LoginLogService,
  operateLogApi: OperateLogService,
};
