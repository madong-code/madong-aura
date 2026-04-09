<template>
  <div class="redis-monitor">
    <!-- 第一行：核心指标卡片 -->
    <el-row :gutter="20" class="card-list mb-20">
      <el-col :sm="12" :md="6" :lg="6" v-for="item in coreMetrics" :key="item.title">
        <div class="card art-custom-card">
          <div class="metric-content">
            <div class="metric-text">
              <div class="metric-title">{{ item.title }}</div>
              <div class="metric-value">{{ item.value }}</div>
              <div class="metric-desc">{{ item.desc }}</div>
            </div>
            <div class="iconfont-sys" v-html="item.icon" v-if="item.icon"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：内存分析 + 缓存效率 -->
    <el-row :gutter="20" class="mb-20">
      <!-- 内存分析 -->
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">内存分析</span>
            </div>
          </template>

          <div v-if="memoryData" class="memory-content">
            <!-- 内存环形图 -->
            <div ref="memoryChartRef" class="memory-chart"></div>

            <!-- 内存详情 -->
            <div class="memory-details">
              <div class="memory-item">
                <span class="label">已用内存</span>
                <span class="value used">{{ formatBytes(memoryData.used_memory) }}</span>
              </div>
              <div class="memory-item">
                <span class="label">峰值内存</span>
                <span class="value peak">{{ formatBytes(memoryData.used_memory_peak) }}</span>
              </div>
              <div class="memory-item">
                <span class="label">物理占用</span>
                <span class="value">{{ formatBytes(memoryData.used_memory_rss) }}</span>
              </div>
              <div class="memory-item">
                <span class="label">碎片率</span>
                <span class="value" :class="{ warning: memoryData.mem_fragmentation_ratio > 1.5 }">
                  {{ memoryData.mem_fragmentation_ratio }}
                </span>
              </div>
            </div>
          </div>

          <el-skeleton v-else-if="loading" :rows="4" animated />
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>

      <!-- 缓存效率 -->
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">缓存效率</span>
            </div>
          </template>

          <div v-if="memoryData" class="cache-content">
            <!-- 命中率环形图 -->
            <div ref="hitRateChartRef" class="memory-chart"></div>

            <!-- 命中率详情 -->
            <div class="memory-details">
              <div class="memory-item">
                <span class="label">命中次数</span>
                <span class="value hit">{{ memoryData.keyspace_hits || 0 }}</span>
              </div>
              <div class="memory-item">
                <span class="label">未命中</span>
                <span class="value miss">{{ memoryData.keyspace_misses || 0 }}</span>
              </div>
              <div class="memory-item">
                <span class="label">命中率</span>
                <span class="value" :class="{ success: hitRate >= 50, danger: hitRate < 30 }">
                  {{ hitRate.toFixed(2) }}%
                </span>
              </div>
              <div class="memory-item">
                <span class="label">过期键</span>
                <span class="value">{{ memoryData.expired_keys || 0 }}</span>
              </div>
            </div>
          </div>

          <el-skeleton v-else-if="loading" :rows="4" animated />
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：性能监控 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">实时性能</span>
              <span class="card-subtitle">每秒操作数 (OPS)</span>
            </div>
          </template>

          <div v-if="memoryData" class="performance-content">
            <el-row :gutter="40">
              <el-col :span="6" v-for="item in performanceMetrics" :key="item.label">
                <div class="perf-item">
                  <div class="perf-value">{{ item.value }}</div>
                  <div class="perf-label">{{ item.label }}</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <el-skeleton v-else-if="loading" :rows="2" animated />
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细信息表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">详细配置信息</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-if="tableData.length">
        <el-table-column prop="key" label="属性" min-width="180" />
        <el-table-column prop="value" label="值" min-width="220">
          <template #default="{ row }">
            <span v-html="row.value"></span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { RedisService } from "@/api/monitor/redis";

// 响应式数据
const redisData = ref({});
const loading = ref(true);
const chartError = ref(null);

// 内存数据（从 variable 获取）
const memoryData = computed(() => redisData.value?.variable || null);

// 命中率
const hitRate = computed(() => {
  if (!memoryData.value) return 0;
  const hits = memoryData.value.keyspace_hits || 0;
  const misses = memoryData.value.keyspace_misses || 0;
  const total = hits + misses;
  return total > 0 ? (hits / total) * 100 : 0;
});

// 核心指标
const coreMetrics = computed(() => {
  const data = redisData.value;
  return [
    {
      title: "运行时间",
      value: formatUptime(data?.uptime_in_seconds || 0),
      desc: data?.uptime_in_days ? `${data.uptime_in_days} 天` : "系统运行",
      icon: "&#xe6ce;",
    },
    {
      title: "连接数",
      value: data?.connected_clients || 0,
      desc: "当前活跃连接",
      icon: "&#xe757;",
    },
    {
      title: "内存使用",
      value: data?.used_memory || "0 B",
      desc: memoryData.value ? formatBytes(memoryData.value.used_memory) : "-",
      icon: "&#xe77c;",
    },
    {
      title: "OPS",
      value: memoryData.value?.instantaneous_ops_per_sec || 0,
      desc: "每秒操作数",
      icon: "&#xe890;",
    },
  ];
});

// 性能指标
const performanceMetrics = computed(() => {
  if (!memoryData.value) return [];
  const v = memoryData.value;
  return [
    {
      label: "每秒操作",
      value: v.instantaneous_ops_per_sec || 0,
    },
    {
      label: "输入流量",
      value: `${v.instantaneous_input_kbps?.toFixed(2) || 0} KB/s`,
    },
    {
      label: "输出流量",
      value: `${v.instantaneous_output_kbps?.toFixed(2) || 0} KB/s`,
    },
    {
      label: "总命令数",
      value: formatNumber(v.total_commands_processed || 0),
    },
  ];
});

// 表格数据
const tableData = computed(() => {
  if (!memoryData.value) return [];

  // 过滤并格式化重要字段
  const importantKeys = [
    'redis_version', 'redis_mode', 'os', 'arch_bits',
    'used_memory', 'used_memory_human', 'used_memory_peak', 'used_memory_peak_human',
    'used_memory_rss', 'mem_fragmentation_ratio', 'mem_allocator',
    'connected_clients', 'total_connections_received',
    'total_commands_processed', 'instantaneous_ops_per_sec',
    'keyspace_hits', 'keyspace_misses',
    'expired_keys', 'evicted_keys',
    'rdb_changes_since_last_save', 'aof_enabled',
    'role', 'tcp_port',
  ];

  return Object.entries(memoryData.value)
    .filter(([key]) => importantKeys.includes(key))
    .map(([key, value]) => ({
      key: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: formatTableValue(value),
    }));
});

// 图表 refs
const memoryChartRef = ref(null);
const hitRateChartRef = ref(null);
let memoryChartInstance = null;
let hitRateChartInstance = null;
let resizeHandler = null;

// 格式化运行时间
function formatUptime(seconds) {
  if (!seconds) return "0天0小时";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}天${hours}小时`;
  return `${hours}小时${mins}分`;
}

// 格式化字节数
function formatBytes(bytes) {
  if (typeof bytes !== "number") return bytes || "-";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

// 格式化数字
function formatNumber(num) {
  if (typeof num !== "number") return num || "-";
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)} M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)} K`;
  return num.toString();
}

// 格式化表格值
function formatTableValue(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "boolean") return value ? "是" : "否";
  return value.toString();
}

// 创建环形图配置
function createPieOption(value, total, centerText, color1, color2) {
  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => `${params.name}: ${formatBytes(params.value)}`,
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "75%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value, name: "已用", itemStyle: { color: color1 } },
          { value: Math.max(0, total - value), name: "剩余", itemStyle: { color: color2 } },
        ],
      },
    ],
    graphic: {
      elements: [
        {
          type: "text",
          left: "center",
          top: "40%",
          style: { text: centerText, textAlign: "center", fill: "#303133", fontSize: 14, fontWeight: "bold" },
        },
        {
          type: "text",
          left: "center",
          top: "55%",
          style: { text: "已用", textAlign: "center", fill: "#909399", fontSize: 12 },
        },
      ],
    },
  };
}

// 初始化内存图表
function initMemoryChart() {
  if (!memoryChartRef.value || !memoryData.value) return;

  if (memoryChartInstance) {
    memoryChartInstance.dispose();
  }

  memoryChartInstance = echarts.init(memoryChartRef.value);

  const used = memoryData.value.used_memory || 0;
  const peak = memoryData.value.used_memory_peak || used;
  const total = Math.max(used, peak) * 1.2; // 峰值 * 1.2 作为总量

  memoryChartInstance.setOption(
    createPieOption(used, total, formatBytes(used), "#409EFF", "#E6F7FF")
  );
}

// 初始化命中率图表
function initHitRateChart() {
  if (!hitRateChartRef.value || !memoryData.value) return;

  if (hitRateChartInstance) {
    hitRateChartInstance.dispose();
  }

  hitRateChartInstance = echarts.init(hitRateChartRef.value);

  const hits = memoryData.value.keyspace_hits || 0;
  const misses = memoryData.value.keyspace_misses || 0;
  const total = hits + misses || 1;

  hitRateChartInstance.setOption(
    createPieOption(hits, total, `${hitRate.value.toFixed(1)}%`, "#67C23A", "#E6FFED")
  );
}

// 初始化所有图表
function initCharts() {
  initMemoryChart();
  initHitRateChart();

  // 响应式
  resizeHandler = () => {
    memoryChartInstance?.resize();
    hitRateChartInstance?.resize();
  };
  window.addEventListener("resize", resizeHandler);
}

// 加载数据
async function loadRedisData() {
  loading.value = true;
  chartError.value = null;

  try {
    const data = await RedisService.list();
    redisData.value = data || {};
    await nextTick();
    initCharts();
  } catch (error) {
    console.error("加载Redis数据失败:", error);
    chartError.value = error.message;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRedisData();
});

onBeforeUnmount(() => {
  memoryChartInstance?.dispose();
  hitRateChartInstance?.dispose();
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
});
</script>

<style lang="scss" scoped>
.redis-monitor {
  .mb-20 {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .card-subtitle {
      font-size: 12px;
      color: #909399;
    }
  }
}

// 卡片样式
.card-list {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  background-color: transparent !important;

  .art-custom-card {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 120px;
    padding: 0 18px;
    transition: all 0.3s ease;
    background: var(--art-main-bg-color, #f5f7fa);
    border-radius: 8px !important;

    $icon-size: 48px;

    .metric-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .metric-text {
        flex: 1;

        .metric-title {
          font-size: 14px;
          color: #909399;
          margin-bottom: 6px;
        }

        .metric-value {
          font-size: 22px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .metric-desc {
          font-size: 12px;
          color: #909399;
        }
      }

      .iconfont-sys {
        width: $icon-size;
        height: $icon-size;
        overflow: hidden;
        font-size: 20px;
        line-height: $icon-size;
        color: var(--el-color-primary, #409eff) !important;
        text-align: center;
        background-color: var(--el-color-primary-light-9, #ecf5ff);
        border-radius: 10px;
      }
    }
  }
}

// 内存分析内容
.memory-content,
.cache-content {
  display: flex;
  flex-direction: column;

  .memory-chart {
    height: 180px;
    width: 100%;
  }

  .memory-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0 10px;

    .memory-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 6px;

      .label {
        font-size: 13px;
        color: #909399;
      }

      .value {
        font-size: 14px;
        font-weight: 600;
        color: #303133;

        &.used { color: #409eff; }
        &.peak { color: #e6a23c; }
        &.hit { color: #67c23a; }
        &.miss { color: #f56c6c; }
        &.success { color: #67c23a; }
        &.danger { color: #f56c6c; }
        &.warning { color: #e6a23c; }
      }
    }
  }
}

// 性能指标
.performance-content {
  .perf-item {
    text-align: center;
    padding: 15px 0;

    .perf-value {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 8px;
    }

    .perf-label {
      font-size: 13px;
      color: #909399;
    }
  }
}

// 深色模式
::deep(.dark) {
  .card-list .art-custom-card {
    background: #1f1f1f !important;

    .metric-text .metric-value,
    .metric-text .metric-title {
      color: #e0e0e0 !important;
    }
  }

  .memory-details .memory-item {
    background: #1f1f1f;

    .label { color: #999; }
    .value { color: #e0e0e0; }
  }

  .performance-content .perf-item {
    .perf-value { color: #409eff; }
    .perf-label { color: #999; }
  }
}
</style>
