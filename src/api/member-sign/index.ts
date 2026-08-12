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

import type { MemberSignRow } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/member-sign/membersign';

export const MemberSignService = {
  ...BaseService<MemberSignRow>({ baseUrl }),
};
