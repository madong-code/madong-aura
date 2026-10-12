import { computed, ref } from 'vue';

import { preferencesManager } from './preferences';

// 主题系统（art 布局）直接控制 html 根节点的 dark class，
// vben preferences 中的 theme.mode 并不会随之更新，
// 这里镜像真实 DOM 状态作为 isDark 的数据源，供 vxe-table / echarts 等消费方跟随主题
const isDarkRef = ref(
  typeof document === 'undefined'
    ? false
    : document.documentElement.classList.contains('dark'),
);

let themeObserverStarted = false;

function startThemeObserver() {
  if (themeObserverStarted || typeof document === 'undefined') {
    return;
  }
  themeObserverStarted = true;
  new MutationObserver(() => {
    isDarkRef.value = document.documentElement.classList.contains('dark');
  }).observe(document.documentElement, {
    attributeFilter: ['class'],
    attributes: true,
  });
}

function usePreferences() {
  startThemeObserver();
  const preferences = preferencesManager.getPreferences();

  const isDark = computed(() => isDarkRef.value);

  const locale = computed(() => preferences.app.locale);

  const isMobile = computed(() => preferences.app.isMobile);

  const theme = computed(() => (isDark.value ? 'dark' : 'light'));

  const layout = computed(() =>
    isMobile.value ? 'sidebar-nav' : preferences.app.layout,
  );

  const appPreferences = computed(() => preferences.app);

  return {
    appPreferences,
    isDark,
    isMobile,
    layout,
    locale,
    theme,
  };
}

export { usePreferences };
