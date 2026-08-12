import type {
  CustomPreferencesRecord,
  Preferences,
  PreferencesExtension,
} from '#/core/preferences/base';
import type { DeepPartial } from '#/core/shared/types/base';

/**
 * 如果你想所有的app都使用相同的默认偏好设置，你可以在这里定义
 * 而不是去修改 #/core/preferences/base 中的默认偏好设置
 * @param preferences
 * @returns
 */

function defineOverridesPreferences(preferences: DeepPartial<Preferences>) {
  return preferences;
}

function definePreferencesExtension<
  TCustomPreferences extends object = CustomPreferencesRecord,
>(extension: PreferencesExtension<TCustomPreferences>) {
  return extension;
}

export { defineOverridesPreferences, definePreferencesExtension };

export * from '#/core/preferences/base';
