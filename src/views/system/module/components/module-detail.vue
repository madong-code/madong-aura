<template>
  <el-dialog
    v-model="dialogVisible"
    title="模块详情"
    width="900px"
    @close="handleClose"
    class="module-detail-dialog"
    draggable
  >
    <div v-if="module" class="space-y-6 max-h-[65vh] overflow-y-auto scrollbar-custom">
      <!-- 顶部详情区域 -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- 左侧海报 - 固定高度并居中显示 -->
        <div class="md:col-span-5 flex justify-center">
          <div class="bg-gray-100 rounded-lg overflow-hidden h-48 w-full max-w-xs">
            <img
              v-if="module.poster"
              :src="module.poster"
              alt="module.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <art-svg-icon
                :icon="getModuleIcon(module.category)"
                :size="80"
                class="text-blue-600"
              />
            </div>
          </div>
        </div>

        <!-- 右侧模块详情 -->
        <div class="md:col-span-7">
          <div class="space-y-4">
            <!-- 标题和标签 -->
            <div>
              <h2 class="text-2xl font-bold mb-3 text-gray-800">{{ module.name }}</h2>
              <div class="flex flex-wrap gap-2">
                <el-tag v-if="module.isNew" size="small" type="danger" effect="light"
                  >新品</el-tag
                >
                <el-tag v-if="module.isHot" size="small" type="warning" effect="light"
                  >热门</el-tag
                >
                <el-tag size="small" type="success" effect="light">{{
                  getCategoryLabel(module.category)
                }}</el-tag>
                <el-tag size="small" type="primary" effect="light">{{
                  module.installed ? "已安装" : "未安装"
                }}</el-tag>
              </div>
            </div>

            <!-- 基础信息 -->
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium text-gray-800">更新时间：</span>
                {{ module.updateTime }}
              </div>
              <div>
                <span class="font-medium text-gray-800">下载次数：</span>
                <art-svg-icon icon="ri:download-line" class="mr-1 inline" :size="13" />
                {{ getRandomDownloadCount() }}
              </div>
              <div>
                <span class="font-medium text-gray-800">模块分类：</span>
                {{ getCategoryLabel(module.category) }}
              </div>
              <div>
                <span class="font-medium text-gray-800">当前版本：</span>
                {{ module.version }}
              </div>
            </div>

            <!-- 开发者信息 -->
            <div>
              <span class="font-medium text-gray-800">开发者：</span>
              <a href="#" class="text-blue-600 hover:underline ml-1">开发者首页</a>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-3 pt-2">
              <el-button
                v-if="!module.purchased"
                type="primary"
                size="large"
                class="flex-1"
              >
                <art-svg-icon icon="ri:shopping-cart-line" class="mr-1" />
                立即购买
              </el-button>
              <el-button
                v-else-if="!module.installed"
                type="success"
                size="large"
                class="flex-1"
              >
                <art-svg-icon icon="ri:download-cloud-line" class="mr-1" />
                立即安装
              </el-button>
              <el-button v-else type="info" size="large" class="flex-1">
                <art-svg-icon icon="ri:refresh-line" class="mr-1" />
                更新
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块介绍 - 移除边框线 -->
      <div class="bg-white rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-3 text-gray-800">模块介绍</h3>
        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {{ module.detailDescription }}
        </div>
      </div>

      <!-- 版本更新时间轴 - 移除边框线 -->
      <div class="bg-white rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">版本更新</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in module.updateLogs"
            :key="index"
            :timestamp="log.date"
            placement="top"
          >
            <div class="text-sm font-medium text-gray-800 mb-1">
              版本 {{ log.version }}
            </div>
            <div class="text-sm text-gray-700 whitespace-pre-line">{{ log.content }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import { moduleCategories } from "../store";

const props = defineProps<{
  visible: boolean;
  module: any;
}>();

const emit = defineEmits(["update:visible"]);

const dialogVisible = ref(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

watch(dialogVisible, (newVal) => {
  emit("update:visible", newVal);
});

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

// 生成随机下载量
const getRandomDownloadCount = () => {
  return Math.floor(Math.random() * 3000) + 500;
};

const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
.module-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

/* 自定义滚动条样式 - 始终显示但与背景色一致，移除上下箭头 */
.scrollbar-custom {
  /* 为滚动条预留空间，避免内容被挤压 */
  scrollbar-gutter: stable;

  /* 滚动条颜色与背景色一致 */
  -ms-overflow-style: auto; /* IE and Edge */
  scrollbar-width: thin; /* Firefox - 薄滚动条，无箭头 */
  scrollbar-color: transparent transparent; /* Firefox - 透明滚动条 */
}

/* Chrome, Safari and Opera - 隐藏滚动条箭头 */
.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent; /* 透明轨道 */
  border-radius: 4px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: transparent; /* 透明滑块 */
  border-radius: 4px;
  border: 2px solid transparent;
}

/* 隐藏上下箭头 */
.scrollbar-custom::-webkit-scrollbar-button {
  display: none;
}

/* 鼠标移入时显示正常滚动条 */
.scrollbar-custom:hover {
  scrollbar-color: #cbd5e0 #f7fafc; /* Firefox */
}

.scrollbar-custom:hover::-webkit-scrollbar-track {
  background: #f7fafc;
}

.scrollbar-custom:hover::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border: 2px solid #f7fafc;
}
</style>
