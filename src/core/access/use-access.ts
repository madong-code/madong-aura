import { computed } from 'vue';

import { preferences, updatePreferences } from '#/core/preferences';
import { useAccessStore, useUserStore } from '#/core/stores';

function useAccess() {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const accessMode = computed(() => {
    return preferences.app.accessMode;
  });

  /**
   * 基于角色判断是否有权限
   * @description: Determine whether there is permission，The role is judged by the user's role
   * @param roles
   */
  function hasAccessByRoles(roles: string[]) {
    const userRoleSet = new Set(userStore.userRoles);
    const intersection = roles.filter((item) => userRoleSet.has(item));
    return intersection.length > 0;
  }

  /**
   * 基于权限码判断是否有权限
   * @description: Determine whether there is permission，The permission code is judged by the user's permission code
   * @param codes
   */
  function hasAccessByCodes(codes: string[]) {
    const userCodes = accessStore.accessCodes;
    const superCodes = accessStore.superCodes;
    const userCodesSet = new Set(userCodes);

    const intersection = codes.filter((item) => userCodesSet.has(item));
    const superMatched = userCodes.some((code) => superCodes.includes(code));
    const result = superMatched || intersection.length > 0;

    return result;
  }

  async function toggleAccessMode() {
    updatePreferences({
      app: {
        accessMode:
          preferences.app.accessMode === 'frontend' ? 'backend' : 'frontend',
      },
    });
  }

  return {
    accessMode,
    hasAccessByCodes,
    hasAccessByRoles,
    toggleAccessMode,
  };
}

export { useAccess };
