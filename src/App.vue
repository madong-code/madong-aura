<template>
  <ElConfigProvider size="default" :locale="locales[language]" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { useUserStore } from "./store/modules/user";
import zh from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { systemUpgrade } from "./utils/sys";

import { setThemeTransitionClass } from "./utils/theme/animation";
import { checkStorageCompatibility } from "./utils/storage";
import { useDictStore } from "./store/modules/dict";
import { DictService } from "./api/system/dict";
import { useSystemConfigStore } from "./store/modules/system-config";

const userStore = useUserStore();
const dictStore = useDictStore();
const systemConfigStore = useSystemConfigStore();
const { language } = storeToRefs(userStore);

const locales = {
  zh: zh,
  en: en,
};

onBeforeMount(() => {
  setThemeTransitionClass(true);
  // 获取站点信息
  systemConfigStore.fetchSystemConfig();
  // 这里可以一次性初始化所有字典
  if (userStore.isLogin) {
    dictStore.initAllDicts(DictService.getAllDict);
  }
});

onMounted(() => {
  // 检查存储兼容性
  checkStorageCompatibility();
  // 提升暗黑主题下页面刷新视觉体验
  setThemeTransitionClass(false);
  // 系统升级
  systemUpgrade();
});
</script>
