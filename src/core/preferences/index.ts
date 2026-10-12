import type { Preferences } from '#/core/preferences/base';
import type { DeepPartial } from '#/core/shared/types/base';

/**
 * 项目级偏好覆盖：只需要提供与默认值不同的字段
 */
function defineOverridesPreferences(preferences: DeepPartial<Preferences>) {
  return preferences;
}

export { defineOverridesPreferences };

export * from '#/core/preferences/base';
