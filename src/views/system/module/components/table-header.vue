<template>
  <div class="mb-4">
    <div class="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
      <div class="flex gap-3">
        <el-button type="primary" plain class="h-8 px-3">
          <art-svg-icon icon="ri:upload-line" class="mr-1" :size="14" />上传安装
        </el-button>
        <el-button type="success" plain class="h-8 px-3">
          <art-svg-icon icon="ri:folder-open-line" class="mr-1" :size="14" />本地安装
        </el-button>
        <el-button type="info" plain class="h-8 px-3">
          <art-svg-icon icon="ri:user-line" class="mr-1" :size="14" />会员信息
        </el-button>
      </div>
      <div class="w-64">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模块..."
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <art-svg-icon icon="ri:search-line" class="el-input__icon" :size="16" />
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";

const emit = defineEmits(["search"]);
const searchKeyword = ref("");

const handleSearch = () => {
  emit("search", searchKeyword.value);
};
</script>
