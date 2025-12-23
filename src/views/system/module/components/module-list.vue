<template>
  <div>
    <el-row :gutter="16">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        v-for="module in modules"
        :key="module.id"
        class="mb-4"
      >
        <div
          class="cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 rounded-lg overflow-hidden bg-white flex flex-col h-full"
          @click="handleViewDetail(module)"
        >
          <!-- 海报区域 -->
          <div class="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
            <!-- 海报图片 -->
            <img
              v-if="module.poster"
              :src="module.poster"
              alt=""
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <!-- 无海报时显示默认内容 -->
            <div v-else class="w-full h-full flex flex-col items-center justify-center">
              <art-svg-icon
                :icon="getModuleIcon(module.category)"
                :size="64"
                class="text-blue-600 mb-2"
              />
              <span class="text-sm text-gray-500">暂无图片</span>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="p-4 flex-1 flex flex-col">
            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-2">
              <el-tag v-if="module.isNew" size="small" type="danger" effect="light"
                >新品</el-tag
              >
              <el-tag v-if="module.isHot" size="small" type="warning" effect="light"
                >热门</el-tag
              >
              <el-tag size="small" type="success" effect="light">{{
                getCategoryLabel(module.category)
              }}</el-tag>
              <el-tag size="small" type="primary" effect="light">
                {{ module.installed ? "已安装" : "未安装" }}
              </el-tag>
            </div>

            <!-- 标题 -->
            <div class="text-lg font-semibold mb-3 text-gray-800">
              <span class="truncate block" :title="module.name">{{ module.name }}</span>
            </div>

            <!-- 描述 -->
            <div class="text-sm text-gray-600 mb-3 flex-1">
              <span class="block line-clamp-2" :title="module.description">{{
                module.description
              }}</span>
            </div>

            <!-- 数据统计 -->
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">
                <art-svg-icon icon="ri:download-line" class="mr-1 inline" :size="13" />
                {{ getRandomDownloadCount() }}
              </span>
              <div>
                <span class="text-primary font-medium">
                  {{ module.purchased ? "已购买" : "可购买" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import { moduleCategories } from "../store";

const props = defineProps<{
  modules: any[];
}>();

const emit = defineEmits(["view-detail"]);

// 获取模块图标
const getModuleIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    all: "ri:app-store-line",
    "full-app": "ri:app-store-line",
    backend: "ri:settings-3-line",
    infrastructure: "ri:server-line",
    "single-page": "ri:file-text-line",
    other: "ri:more-fill",
  };
  return iconMap[category] || "ri:app-store-line";
};

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categoryObj = moduleCategories.find((cat) => cat.key === category);
  return categoryObj ? categoryObj.label : category;
};

// 生成随机下载量（模拟数据）
const getRandomDownloadCount = () => {
  return Math.floor(Math.random() * 3000) + 500;
};

// 查看详情
const handleViewDetail = (module: any) => {
  emit("view-detail", module);
};
</script>

<style scoped>
/* 去除了所有scss样式，完全使用tailwind.css */
</style>
