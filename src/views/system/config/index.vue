<script setup lang="ts">
import type { TabsPaneContext } from 'element-plus';

import { defineAsyncComponent, markRaw, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElCard, ElTabPane, ElTabs } from 'element-plus';

import { Page } from '#/components/page';
import { useAccess } from '#/core/access';
import { $t } from '#/locales';

const router = useRouter();
const { hasAccessByCodes } = useAccess();
const activeName = ref('1');
const COMMON_TAB_KEY = 'nav-common';

const handleClick = (tab: TabsPaneContext) => {
  const targetKey = tab.props.name as string;

  // 点击"配置项管理"标签 → 跳转独立页面，不切换 Tab
  if (targetKey === COMMON_TAB_KEY) {
    router.push('/system/config-common');
    return;
  }

  settingList.value.forEach((item) => {
    if (item.key === targetKey) {
      item.loadKey += 1;
    }
  });
};

const settingList = ref([
  {
    component: markRaw(
      defineAsyncComponent(() => import('./components/site.vue')),
    ),
    key: '1',
    name: $t('system.config.site.title'),
    loadKey: 0,
  },
  // {
  //   component: markRaw(
  //     defineAsyncComponent(() => import('./components/web-site.vue')),
  //   ),
  //   key: '6',
  //   name: $t('system.config.web_site.title'),
  //   loadKey: 0,
  // },
  // {
  //   component: markRaw(
  //     defineAsyncComponent(() => import('./components/baidu-tongji.vue')),
  //   ),
  //   key: '7',
  //   name: $t('system.config.baidu_tongji.title'),
  //   loadKey: 0,
  // },
  {
    component: markRaw(
      defineAsyncComponent(() => import('./components/upload.vue')),
    ),
    key: '2',
    name: $t('system.config.upload.title'),
    loadKey: 0,
  },
  {
    component: markRaw(
      defineAsyncComponent(() => import('./components/email.vue')),
    ),
    key: '3',
    name: $t('system.config.email.title'),
    loadKey: 0,
  },
  {
    component: markRaw(
      defineAsyncComponent(() => import('./components/sms.vue')),
    ),
    key: '4',
    name: $t('system.config.sms.title'),
    loadKey: 0,
  },
]);
</script>

<template>
  <Page>
    <ElCard>
      <ElTabs v-model="activeName" @tab-click="handleClick">
        <ElTabPane
          v-for="item in settingList"
          :key="item.key"
          :name="item.key"
          :label="item.name"
          class="mt-5"
        >
          <component :is="item.component" :key="item.loadKey" v-bind="$attrs" />
        </ElTabPane>
        <!-- 配置项管理 - 作为 Tabs 最右侧标签，点击跳转独立页面 -->
        <ElTabPane
          v-if="hasAccessByCodes(['system:config:create'])"
          :name="COMMON_TAB_KEY"
          :label="$t('system.config.common.title')"
        />
      </ElTabs>
    </ElCard>
  </Page>
</template>
