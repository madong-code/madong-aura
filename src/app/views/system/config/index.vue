<template>
  <div class="page-content" style="margin-bottom: 20px">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="item in settingList" :key="item.key" :name="item.key" :label="item.name">
        <!-- 关键：给组件绑定动态key（基于loadKey） -->
        <component :is="item.component" :key="item.loadKey" v-bind="$attrs" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="tsx">
  import { ref, defineAsyncComponent, markRaw } from 'vue'
  import type { TabsPaneContext } from 'element-plus'
  import { $t } from '@/locales'

  const activeName = ref('1')

  const handleClick = (tab: TabsPaneContext, event: Event) => {
    // 关键：点击标签时，更新该标签的loadKey
    const targetKey = tab.props.name
    settingList.value.forEach((item) => {
      if (item.key === targetKey) {
        item.loadKey += 1 // 每次点击已激活的标签，loadKey+1
      }
    })
  }

  // 参数标签页（新增loadKey属性）
  const settingList = ref([
    {
      component: markRaw(
        defineAsyncComponent(() => import('@/app/views/system/config/modules/site.vue'))
      ),
      key: '1',
      name: $t('system.config.site.title'),
      loadKey: 0
    },
    {
      component: markRaw(
        defineAsyncComponent(() => import('@/app/views/system/config/modules/upload.vue'))
      ),
      key: '2',
      name: $t('system.config.upload.title'),
      loadKey: 0
    },
    {
      component: markRaw(
        defineAsyncComponent(() => import('@/app/views/system/config/modules/email.vue'))
      ),
      key: '3',
      name: $t('system.config.email.title'),
      loadKey: 0
    },
    {
      component: markRaw(
        defineAsyncComponent(() => import('@/app/views/system/config/modules/sms.vue'))
      ),
      key: '4',
      name: $t('system.config.sms.title'),
      loadKey: 0
    }
  ])
</script>
