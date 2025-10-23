<template>
  <div class="page-content" style="margin-bottom: 20px">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane
        v-for="item in settingList"
        :key="item.key"
        :name="item.key"
        :label="item.name"
      >
        <component :is="item.component" v-bind="$attrs" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="tsx">
import { ref, defineAsyncComponent } from "vue";
import type { TabsPaneContext } from "element-plus";
import { $t } from "@/locales";

const activeName = ref("1");

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};

//参数标签页
const settingList = ref([
  {
    component: defineAsyncComponent(
      () => import("@/views/system/config/modules/site-setting.vue")
    ),
    key: "1",
    name: $t("system.config.site.title"),
  },
  {
    component: defineAsyncComponent(
      () => import("@/views/system/config/modules/upload-setting.vue")
    ),
    key: "2",
    name: $t("system.config.upload.title"),
  },
  {
    component: defineAsyncComponent(
      () => import("@/views/system/config/modules/email-setting.vue")
    ),
    key: "3",
    name: $t("system.config.email.title"),
  },
  {
    component: defineAsyncComponent(
      () => import("@/views/system/config/modules/sms-setting.vue")
    ),
    key: "4",
    name: $t("system.config.sms.title"),
  },
]);
</script>
