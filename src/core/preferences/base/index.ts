import { preferencesManager } from './preferences';

export const {
  clearCache,
  getCustomPreferences,
  getInitialCustomPreferences,
  getInitialPreferences,
  getPreferences,
  getPreferencesExtension,
  initPreferences,
  resetPreferences,
  setPreferences,
  updateCustomPreferences,
  updatePreferences,
} = preferencesManager;

export const preferences = getPreferences();

export { preferencesManager, PreferenceManager } from './preferences';

export * from './constants';
export type * from './types';
export * from './use-preferences';
