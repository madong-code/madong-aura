<script setup lang="ts">
import type { PropType } from "vue";
import { ref, computed, watch } from "vue";
import { ElDialog, ElButton, ElInput, ElSelect, ElOption, ElPagination, ElMessage } from "element-plus";
import { FilesService } from "@/api/tools/files";
import { Icon } from "@/components/icon";
import { buildStaticUrl, extractRelativePath } from "@/utils/url/static-resource";

defineOptions({
  name: "ResourceManager",
  inheritAttrs: false,
});

const props = defineProps({
  value: {
    type: [String, Array] as PropType<string | string[]>,
    default: "",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: "image/*",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  objectType: {
    type: String,
    default: "default",
  },
});

const emits = defineEmits(["update:value", "change"]);

const dialogVisible = ref(false);
const loading = ref(false);
const searchKeyword = ref("");
const currentPage = ref(1);
const pageSize = ref(14);
const total = ref(0);
const selectedFiles = ref<string[]>([]);
const fileList = ref<any[]>([]);
const categories = ref<any[]>([]);
const selectedCategory = ref("");

// 初始化
const init = () => {
  if (props.value) {
    if (Array.isArray(props.value)) {
      selectedFiles.value = [...props.value];
    } else {
      selectedFiles.value = props.value ? [props.value] : [];
    }
  }
  fetchCategories();
  fetchFiles();
};

// 获取分类
const fetchCategories = async () => {
  try {
    const res = await FilesService.getCategories();
    categories.value = res || [];
  } catch (error) {
    console.error("获取分类失败:", error);
  }
};

// 获取文件列表
const fetchFiles = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      categoryId: selectedCategory.value,
      objectType: props.objectType,
    };
    const res = await FilesService.getFileList(params);
    fileList.value = res?.list || [];
    total.value = res?.total || 0;
  } catch (error) {
    console.error("获取文件列表失败:", error);
    ElMessage.error("获取文件列表失败");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchFiles();
};

// 分页变化
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchFiles();
};

// 选择文件
const toggleFileSelection = (fileId: string) => {
  if (props.multiple) {
    const index = selectedFiles.value.indexOf(fileId);
    if (index > -1) {
      selectedFiles.value.splice(index, 1);
    } else {
      selectedFiles.value.push(fileId);
    }
  } else {
    selectedFiles.value = [fileId];
  }
};

// 打开资源管理器
const openResourceManager = () => {
  if (props.disabled) return;
  init();
  dialogVisible.value = true;
};

// 确认选择
const confirmSelection = () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning("请选择至少一个文件");
    return;
  }
  
  const value = props.multiple ? selectedFiles.value : selectedFiles.value[0];
  emits("update:value", value);
  emits("change", value);
  dialogVisible.value = false;
};

// 取消选择
const cancelSelection = () => {
  dialogVisible.value = false;
};

// 上传图片
const handleUpload = () => {
  // 这里可以集成上传组件，或者跳转到上传页面
  ElMessage.info("上传功能开发中");
};

// 计算显示值
const displayValue = computed(() => {
  if (!props.value) return "请选择";
  if (Array.isArray(props.value)) {
    return `${props.value.length}个文件`;
  }
  return props.value;
});

// 监听 value 变化
watch(
  () => props.value,
  (val) => {
    if (val) {
      if (Array.isArray(val)) {
        selectedFiles.value = [...val];
      } else {
        selectedFiles.value = val ? [val] : [];
      }
    } else {
      selectedFiles.value = [];
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="resource-manager">
    <ElButton 
      type="primary" 
      @click="openResourceManager" 
      :disabled="disabled"
    >
      <Icon icon="ant-design:picture-outlined" />
      选择图片
    </ElButton>
    
    <div v-if="value" class="selected-info">
      <span>{{ displayValue }}</span>
      <ElButton 
        link 
        type="danger" 
        size="small" 
        @click="emits('update:value', props.multiple ? [] : ''); emits('change', props.multiple ? [] : '')"
      >
        <Icon icon="ant-design:delete-outlined" />
        清除
      </ElButton>
    </div>
    
    <!-- 资源管理器弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      title="选择图片"
      width="800px"
      destroy-on-close
    >
      <!-- 搜索和上传区域 -->
      <div class="dialog-header">
        <div class="search-area">
          <ElSelect 
            v-model="selectedCategory" 
            placeholder="请选择" 
            style="width: 150px; margin-right: 10px"
            @change="handleSearch"
          >
            <ElOption label="全部" value="" />
            <ElOption 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id" 
            />
          </ElSelect>
          <ElInput
            v-model="searchKeyword"
            placeholder="搜索图片名称"
            style="width: 300px; margin-right: 10px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="ant-design:search-outlined" />
            </template>
          </ElInput>
          <ElButton type="primary" @click="handleSearch">
            <Icon icon="ant-design:search-outlined" />
            搜索
          </ElButton>
        </div>
        <ElButton type="success" @click="handleUpload">
          <Icon icon="ant-design:upload-outlined" />
          上传图片
        </ElButton>
      </div>
      
      <!-- 图片列表 -->
      <div class="file-list" v-loading="loading">
        <div 
          v-for="file in fileList" 
          :key="file.id"
          class="file-item"
          :class="{ selected: selectedFiles.includes(file.id) }"
          @click="toggleFileSelection(file.id)"
        >
          <div class="file-preview">
            <img :src="buildStaticUrl(file.base_path)" :alt="file.name" />
          </div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ (file.size / 1024).toFixed(2) }} KB</div>
          </div>
        </div>
        <div v-if="fileList.length === 0 && !loading" class="empty-state">
          <Icon icon="ant-design:picture-outlined" size="48" />
          <p>暂无图片</p>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="dialog-footer">
        <div class="pagination">
          <span>共 {{ total }} 条</span>
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 14, 20, 50]"
            layout="sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handlePaginationChange"
            @current-change="handlePaginationChange"
          />
        </div>
        <div class="actions">
          <ElButton @click="cancelSelection">取消</ElButton>
          <ElButton type="primary" @click="confirmSelection">确定</ElButton>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.resource-manager {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #303133;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-area {
  display: flex;
  align-items: center;
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.file-item {
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    border-color: #409eff;
    background-color: rgba(64, 158, 255, 0.1);
  }
}

.file-preview {
  width: 100%;
  height: 80px;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 4px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.file-info {
  font-size: 12px;
  color: #606266;
  
  .file-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  
  .file-size {
    color: #909399;
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  
  p {
    margin-top: 10px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    font-size: 14px;
    color: #606266;
  }
}

.actions {
  display: flex;
  gap: 10px;
}
</style>