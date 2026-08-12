import type { TemplateRecord } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/content/message/template';

export const TemplateService = {
  ...BaseService<TemplateRecord>({ baseUrl }),
};
