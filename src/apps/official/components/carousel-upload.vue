<script setup lang="ts">
import { ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { ElUpload as Upload, ElButton, ElMessage } from "element-plus";
import { FilesService } from "@/api/tools/files";
import { Icon } from "@/components/icon";
import { buildStaticUrl, extractRelativePath } from "@/utils/url/static-resource";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  value: {
    type: Array as () => string[],
    default: () => [],
  },
  // 是否自动添加/移除公共路径前缀
  autoHandleBaseUrl: {
    type: Boolean,
    default: true,
  },
  // 最大上传图片数量
  maxCount: {
    type: Number,
    default: 10,
  },
  // 单个图片宽度
  width: {
    type: Number,
    default: 120,
  },
  // 单个图片高度
  height: {
    type: Number,
    default: 80,
  },
});

const emits = defineEmits(["update:value", "change"]);
const mValue = useVModel(props, "value", emits);

// 轮播图列表
const carouselList = ref<{ url: string }[]>([]);

/**
 * 获取图片完整 URL（用于显示）
 */
const getDisplayUrl = (url: string): string => {
  if (!url) return "";
  if (!props.autoHandleBaseUrl) return url;
  return buildStaticUrl(url);
};

/**
 * 获取存储 URL（用于保存到数据库）
 */
const getStorableUrl = (url: string): string => {
  if (!url) return "";
  if (!props.autoHandleBaseUrl) return url;
  const relativePath = extractRelativePath(url);
  // 确保返回的 URL 以 / 开头
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
};

/**
 * 初始化轮播图列表
 */
const initCarouselList = () => {
  if (Array.isArray(props.value)) {
    carouselList.value = props.value.map((url) => ({ url }));
  } else {
    carouselList.value = [];
  }
};

/**
 * 上传处理
 */
const customRequest = async (e: any) => {
  try {
    // 检查是否超过最大数量限制
    if (carouselList.value.length >= props.maxCount) {
      ElMessage.warning(`最多只能上传 ${props.maxCount} 张图片`);
      return;
    }

    const data = await FilesService.uploadFile({
      file: e.file,
    });

    // 处理上传的图片 URL
    const imgUrl = getStorableUrl(data.base_path || "");

    // 添加到列表
    carouselList.value.push({ url: imgUrl });

    // 更新父组件的值（返回 URL 数组）
    mValue.value = carouselList.value.map((item) => item.url);

    // 触发 change 事件
    emits("change", carouselList.value.map((item) => item.url));
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

/**
 * 删除单个轮播图
 */
const handleRemoveItem = (index: number, e: Event) => {
  e.stopPropagation();
  carouselList.value.splice(index, 1);
  mValue.value = carouselList.value.map((item) => item.url);
  emits("change", carouselList.value.map((item) => item.url));
};

/**
 * 移动轮播图位置
 */
const handleMoveLeft = (index: number, e: Event) => {
  e.stopPropagation();
  if (index > 0) {
    const temp = carouselList.value[index];
    carouselList.value[index] = carouselList.value[index - 1];
    carouselList.value[index - 1] = temp;
    mValue.value = carouselList.value.map((item) => item.url);
    emits("change", carouselList.value.map((item) => item.url));
  }
};

const handleMoveRight = (index: number, e: Event) => {
  e.stopPropagation();
  if (index < carouselList.value.length - 1) {
    const temp = carouselList.value[index];
    carouselList.value[index] = carouselList.value[index + 1];
    carouselList.value[index + 1] = temp;
    mValue.value = carouselList.value.map((item) => item.url);
    emits("change", carouselList.value.map((item) => item.url));
  }
};

// 监听外部 value 变化
watch(
  () => props.value,
  () => {
    initCarouselList();
  },
  { immediate: true }
);
</script>

<template>
  <div class="carousel-upload">
    <Upload
      :http-request="customRequest"
      :show-file-list="false"
      :disabled="carouselList.length >= maxCount"
      class="m-upload upload-trigger"
    >
      <el-button
        type="primary"
        :disabled="carouselList.length >= maxCount"
      >
        <Icon icon="ant-design:upload-outlined" />
        上传图片 ({{ carouselList.length }}/{{ maxCount }})
      </el-button>
    </Upload>

    <div v-if="carouselList.length > 0" class="carousel-list">
      <div
        v-for="(item, index) in carouselList"
        :key="index"
        class="carousel-item"
        :style="{ '--item-width': width + 'px', '--item-height': height + 'px' }"
      >
        <img :src="getDisplayUrl(item.url)" alt="carousel" />
        <div class="item-actions">
          <div class="actions-top">
            <Icon
              class="action-icon delete-icon"
              icon="ant-design:close-outlined"
              @click="handleRemoveItem(index, $event)"
            />
          </div>
          <div class="actions-bottom">
            <Icon
              v-if="index > 0"
              class="action-icon move-left"
              icon="ant-design:left-outlined"
              @click="handleMoveLeft(index, $event)"
            />
            <Icon
              v-if="index < carouselList.length - 1"
              class="action-icon move-right"
              icon="ant-design:right-outlined"
              @click="handleMoveRight(index, $event)"
            />
          </div>
        </div>
        <div class="item-index">{{ index + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carousel-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-trigger {
  :deep(.el-upload) {
    display: inline-block;
  }
}

.carousel-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.carousel-item {
  position: relative;
  width: var(--item-width);
  height: var(--item-height);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px;
    opacity: 0;
    transition: opacity 0.3s;

    .actions-top {
      display: flex;
      justify-content: flex-end;
    }

    .actions-bottom {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .action-icon {
      cursor: pointer;
      color: #fff;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      padding: 4px;
      font-size: 14px;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      &.delete-icon {
        color: #fff;
        background: rgba(255, 77, 79, 0.9);

        &:hover {
          background: #ff4d4f;
        }
      }
    }
  }

  &:hover {
    .item-actions {
      opacity: 1;
    }
  }

  .item-index {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 10px;
  }
}
</style>
