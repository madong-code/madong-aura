<script setup lang="ts">
  import type { TabsPaneContext } from 'element-plus'

  import { defineAsyncComponent, markRaw, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { ElTabPane, ElTabs } from 'element-plus'

  import { Page } from '#/components/page'
  import { useAccess } from '#/core/access'
  import { $t } from '#/locales'

  const router = useRouter()
  const { hasAccessByCodes } = useAccess()
  const activeName = ref('1')
  const COMMON_TAB_KEY = 'nav-common'

  const handleClick = (tab: TabsPaneContext) => {
    const targetKey = tab.props.name as string

    // 点击"配置项管理"标签 → 跳转独立页面，不切换 Tab
    if (targetKey === COMMON_TAB_KEY) {
      router.push('/system/config-common')
      return
    }

    settingList.value.forEach((item) => {
      if (item.key === targetKey) {
        item.loadKey += 1
      }
    })
  }

  const settingList = ref([
    // 站点设置（site_setting）：ERP 后台管理系统自身的站点信息；
    // web 前台门户站点设置在「基础管理 → 公共设置 → 网站设置 → 站点设置」（web_site_setting 行），两者分离存储
    {
      component: markRaw(defineAsyncComponent(() => import('./components/site.vue'))),
      key: '1',
      name: $t('system.config.site.title'),
      loadKey: 0
    },
    {
      component: markRaw(defineAsyncComponent(() => import('./components/upload.vue'))),
      key: '2',
      name: $t('system.config.upload.title'),
      loadKey: 0
    },
    {
      component: markRaw(defineAsyncComponent(() => import('./components/email.vue'))),
      key: '3',
      name: $t('system.config.email.title'),
      loadKey: 0
    },
    {
      component: markRaw(defineAsyncComponent(() => import('./components/sms.vue'))),
      key: '4',
      name: $t('system.config.sms.title'),
      loadKey: 0
    }
  ])
</script>

<template>
  <Page content-class="p-4 md:p-6">
    <div class="min-w-0">
      <ElTabs v-model="activeName" class="config-tabs" @tab-click="handleClick">
        <ElTabPane v-for="item in settingList" :key="item.key" :name="item.key" :label="item.name">
          <component :is="item.component" :key="item.loadKey" v-bind="$attrs" />
        </ElTabPane>
        <!-- 配置项管理 - 作为 Tabs 最右侧标签，点击跳转独立页面 -->
        <ElTabPane
          v-if="hasAccessByCodes(['system:config:create'])"
          :name="COMMON_TAB_KEY"
          :label="$t('system.config.common.title')"
        />
      </ElTabs>
    </div>
  </Page>
</template>

<style scoped>
  .config-tabs {
    --el-tabs-header-height: 40px;
  }

  .config-tabs :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  .config-tabs :deep(.el-tabs__nav-wrap) {
    overflow-x: auto;
  }

  .config-tabs :deep(.el-tabs__nav-wrap::after) {
    background-color: var(--el-border-color-lighter);
  }

  .config-tabs :deep(.el-tabs__item) {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    font-weight: 400;
  }

  .config-tabs :deep(.el-tabs__item:hover),
  .config-tabs :deep(.el-tabs__item.is-active) {
    color: var(--el-color-primary);
  }

  .config-tabs :deep(.el-tabs__item.is-active) {
    font-weight: 500;
  }
</style>
