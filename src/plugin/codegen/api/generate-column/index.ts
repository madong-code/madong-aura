/**
 *+------------------
 * madong
 *+------------------
 * Copyright (c) https://gitee.com/motion-code  All rights reserved.
 *+------------------
 * Author: Mr. April (405784684@qq.com)
 *+------------------
 * Official Website: https://madong.tech
 */

import type { GenerateColumnRow } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/generate-column/generatecolumn';

export const GenerateColumnService = {
  ...BaseService<GenerateColumnRow>({ baseUrl }),
};
