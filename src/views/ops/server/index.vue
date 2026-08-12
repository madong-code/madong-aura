<script setup>
import { onMounted, ref } from 'vue';

import {
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElProgress,
  ElStatistic,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { ServerService } from '#/api/ops/server';

// 响应式数据
const serverData = ref({
  cpu: {},
  memory: {},
  disk: [],
  php: {},
});

// 自定义进度条颜色
const customColors = [
  { color: '#409EFF', percentage: 30 },
  { color: '#67C23A', percentage: 70 },
  { color: '#E6A23C', percentage: 100 },
];

const toNumber = (value) => {
  const number = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(number) ? number : 0;
};

// 获取服务器数据
const loadServerData = async () => {
  try {
    const data = await ServerService.list();
    serverData.value = data;
  } catch (error) {
    console.error('加载数据失败:', error);
    // 这里可以添加错误处理逻辑，如显示错误提示
  }
};

onMounted(() => {
  loadServerData();
});
</script>

<template>
  <div class="performance-monitor">
    <!-- CPU 监控卡片 -->
    <ElCard shadow="hover" class="mb-20 monitor-card">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-cpu"></i> CPU 监控</span>
        </div>
      </template>

      <div class="metric-container">
        <ElStatistic
          :value="toNumber(serverData.cpu?.cpu_usage_percentage)"
          :title="serverData.cpu?.cpu_name || '未知CPU'"
          class="mb-20"
        >
          <template #suffix>
            <span>%</span>
          </template>
        </ElStatistic>

        <ElProgress
          :percentage="toNumber(serverData.cpu?.cpu_usage_percentage)"
          :stroke-width="18"
          :color="customColors"
          :show-text="false"
          class="mb-10"
        />

        <ElDescriptions :column="2" border class="cpu-details">
          <ElDescriptionsItem label="物理核心">
            {{ serverData.cpu?.physical_cores || '0' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="逻辑核心">
            {{ serverData.cpu?.logical_cores || '0' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="缓存大小">
            {{ serverData.cpu?.cache_size_mb || '0' }} MB
          </ElDescriptionsItem>
          <ElDescriptionsItem label="空闲率">
            {{ serverData.cpu?.free_cpu_percentage || '0' }}%
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElCard>

    <!-- 内存监控卡片 -->
    <ElCard shadow="hover" class="mb-20 monitor-card">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-memory"></i> 内存监控</span>
        </div>
      </template>

      <div class="metric-container">
        <ElStatistic
          :value="toNumber(serverData.memory?.memory_usage_rate)"
          title="内存使用率"
          class="mb-20"
        >
          <template #suffix>
            <span>%</span>
          </template>
        </ElStatistic>

        <ElProgress
          :percentage="toNumber(serverData.memory?.memory_usage_rate)"
          :stroke-width="18"
          :color="customColors"
          :show-text="false"
          class="mb-10"
        />

        <ElDescriptions :column="3" border class="memory-details">
          <ElDescriptionsItem label="总内存">
            {{ serverData.memory?.total_memory || '0' }} GB
          </ElDescriptionsItem>
          <ElDescriptionsItem label="已用内存">
            {{ serverData.memory?.used_memory || '0' }} GB
          </ElDescriptionsItem>
          <ElDescriptionsItem label="可用内存">
            {{ serverData.memory?.available_memory || '0' }}
            GB
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElCard>

    <!-- 磁盘监控卡片 -->
    <ElCard shadow="hover" class="mb-20 monitor-card">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-disk"></i> 磁盘监控</span>
        </div>
      </template>

      <ElTable :data="serverData.disk" style="width: 100%">
        <ElTableColumn prop="filesystem" label="文件系统" />
        <ElTableColumn prop="size" label="总大小" />
        <ElTableColumn prop="used" label="已用空间" />
        <ElTableColumn prop="available" label="可用空间" />
        <ElTableColumn prop="use_percentage" label="使用率">
          <template #default="{ row }">
            <ElProgress
              :percentage="parseInt(row.use_percentage.replace('%', ''))"
              :stroke-width="12"
              :show-text="true"
              :color="customColors"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="mounted_on" label="挂载点" />
      </ElTable>
    </ElCard>

    <!-- PHP 配置信息 -->
    <ElCard shadow="hover" class="monitor-card mb-20">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-document"></i> PHP 配置</span>
        </div>
      </template>

      <ElDescriptions
        :column="2"
        border
        class="php-config"
        v-if="serverData.php"
      >
        <ElDescriptionsItem
          label="PHP版本"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.php_version }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="操作系统"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.os }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="项目路径"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          <div class="project-path">{{ serverData.php?.project_path }}</div>
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="内存限制"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.memory_limit }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="最大执行时间"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{
            serverData.php?.max_execution_time === '0'
              ? '无限制'
              : `${serverData.php?.max_execution_time}秒`
          }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="错误报告"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.error_reporting }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="显示错误"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.display_errors }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="上传限制"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.upload_max_filesize }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="POST大小"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.post_max_size }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="扩展目录"
          label-class-name="php-label"
          content-class-name="php-content"
        >
          {{ serverData.php?.extension_dir }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          label="已加载扩展"
          :span="2"
          label-class-name="php-label-full"
          content-class-name="php-content-full"
        >
          <div class="extensions-container">
            <ElTag
              v-for="ext in serverData.php?.loaded_extensions?.split(', ')"
              :key="ext"
              size="small"
              class="php-ext-tag"
            >
              {{ ext }}
            </ElTag>
          </div>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
.performance-monitor {
  padding: 15px;

  .monitor-card {
    margin-bottom: 20px;
    border-radius: 8px !important;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    }

    :deep(.el-card__header) {
      border-radius: 8px 8px 0 0 !important;
    }

    :deep(.el-card__body) {
      border-radius: 0 0 8px 8px !important;
    }
  }

  .mb-20 {
    margin-bottom: 20px;
  }

  .mb-10 {
    margin-bottom: 10px;
  }

  .card-header {
    display: flex;
    gap: 8px;
    align-items: center;

    i {
      font-size: 18px;
      color: var(--el-color-primary, #409eff);
    }

    span {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .metric-container {
    padding: 0 20px;
  }

  .cpu-details,
  .memory-details {
    margin-top: 20px;
  }

  .php-ext-tag {
    margin-right: 5px;
    margin-bottom: 5px;
  }
}

.php-config {
  :deep(.el-descriptions__label) {
    min-width: 120px !important;
    word-break: normal;
  }

  :deep(.el-descriptions__content) {
    width: calc(100% - 120px) !important;
    word-break: break-all;
  }

  .project-path {
    max-width: 500px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.extensions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 120px;
  padding: 8px;
  overflow-y: auto;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.php-label-full {
  grid-column: 1 / span 2;
}

.php-content-full {
  grid-column: 1 / span 2;
}

// 深色模式支持
:deep(.dark) {
  :root {
    --art-main-bg-color: #141414;
  }

  .extensions-container {
    background: #232323;
  }
}
</style>
