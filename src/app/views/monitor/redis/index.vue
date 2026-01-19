<template>
  <div class="redis-monitor">
    <!-- 指标卡片 -->
    <el-row :gutter="20" class="card-list mb-20">
      <el-col
        :sm="12"
        :md="6"
        :lg="6"
        v-for="item in keyMetrics"
        :key="item.title"
        v-if="redisData.variable"
      >
        <div class="card art-custom-card">
          <div class="metric-content">
            <div class="metric-text">
              <div class="metric-title">{{ item.title }}</div>
              <div class="metric-value">{{ item.value || "-" }}</div>
              <div class="metric-desc">{{ item.desc }}</div>
            </div>
            <div class="iconfont-sys" v-html="item.icon" v-if="item.icon"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 内存使用图表 -->
    <el-card shadow="hover" class="mb-20 chart-card" v-if="redisData.variable">
      <div class="chart-title">内存使用分析</div>
      <div ref="memoryChart" class="chart-container" v-if="memoryChartVisible"></div>
      <el-skeleton v-else :rows="4" animated />

      <!-- 错误提示 -->
      <el-alert
        v-if="chartError"
        type="error"
        :title="`图表加载失败: ${chartError}`"
        show-icon
        class="mt-10"
      />
    </el-card>

    <!-- 详细信息表格 -->
    <el-card shadow="hover" class="table-card mb-20" v-if="redisData.variable">
      <div class="chart-title">详细配置信息</div>
      <el-table :data="tableData" style="width: 100%" v-if="tableData.length">
        <el-table-column prop="key" label="属性" min-width="180" />
        <el-table-column prop="value" label="值" min-width="220">
          <template #default="{ row }">
            <span v-html="row.value || '-'"></span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onBeforeUnmount, computed } from "vue";
import * as echarts from "echarts";
import { RedisService } from "@/app/api/monitor/redis";

// 响应式数据
const redisData = ref({
  variable: null,
  uptime_in_seconds: 0,
  connected_clients: 0,
  used_memory: "0 B",
  hit_rate: 0,
});

// 关键指标配置
const keyMetrics = reactive([
  {
    title: "运行时间",
    value: computed(() => formatUptime(redisData.value.uptime_in_seconds)),
    desc: "系统运行时间",
    icon: "&#xe6ce;",
  },
  {
    title: "连接数",
    value: computed(() => redisData.value.connected_clients || 0),
    desc: "当前活跃连接",
    icon: "&#xe757;",
  },
  {
    title: "内存使用",
    value: computed(() => redisData.value.used_memory || "0 B"),
    desc: "已用内存",
    icon: "&#xe77c;",
  },
  {
    title: "命中率",
    value: computed(() =>
      redisData.value.hit_rate ? `${(redisData.value.hit_rate * 100).toFixed(2)}%` : "0%"
    ),
    desc: "缓存命中率",
    icon: "&#xe890;",
  },
]);

// 表格数据
const tableData = computed(() => {
  if (!redisData.value.variable) return [];

  return Object.entries(redisData.value.variable).map(([key, value]) => ({
    key: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: typeof value === "number" ? formatNumber(value) : value.toString(),
  }));
});

// 图表状态
const memoryChart = ref(null);
const memoryChartInstance = ref(null);
const memoryChartVisible = ref(false);
const chartError = ref(null);

// 格式化工具函数
function formatUptime(seconds) {
  if (!seconds) return "0天0小时";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}天${hours}小时`;
}

function formatNumber(num) {
  if (typeof num !== "number") return "-";

  if (num >= 1024 ** 3) {
    return `${(num / 1024 ** 3).toFixed(2)} GB`;
  } else if (num >= 1024 ** 2) {
    return `${(num / 1024 ** 2).toFixed(2)} MB`;
  } else if (num >= 1024) {
    return `${(num / 1024).toFixed(2)} KB`;
  }
  return `${num} B`;
}

// 初始化内存图表
function initMemoryChart() {
  if (!memoryChart.value || !redisData.value.variable) return;

  // 重置错误状态
  chartError.value = null;

  try {
    // 数据校验
    const used = redisData.value.variable.used_memory;
    const total = redisData.value.variable.total_system_memory;

    if (typeof used !== "number" || typeof total !== "number") {
      throw new Error("内存数据格式错误");
    }

    // 初始化图表
    memoryChartInstance.value = echarts.init(memoryChart.value);
    memoryChartVisible.value = true;

    const memoryOption = {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: ["已用内存", "可用内存"],
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value} GB",
          fontSize: 12,
        },
      },
      series: [
        {
          name: "内存使用",
          type: "bar",
          barWidth: "60%",
          data: [
            {
              value: used,
              name: "已用内存",
              itemStyle: { color: "#409EFF" },
            },
            {
              value: Math.max(0, total - used),
              name: "可用内存",
              itemStyle: { color: "#67C23A" },
            },
          ],
          label: {
            show: true,
            position: "top",
            formatter: "{c} GB",
            fontSize: 12,
          },
        },
      ],
    };

    memoryChartInstance.value.setOption(memoryOption);

    // 响应式调整
    const resizeHandler = () => memoryChartInstance.value?.resize();
    window.addEventListener("resize", resizeHandler);
    onBeforeUnmount(() => window.removeEventListener("resize", resizeHandler));
  } catch (error) {
    console.error("图表初始化失败:", error);
    chartError.value = error.message;
    memoryChartVisible.value = false;
  }
}

// 获取Redis数据
const loadRedisData = async () => {
  try {
    const data = await RedisService.list();
    redisData.value = data;

    // 初始化图表
    if (data.variable) {
      initMemoryChart();
    }
  } catch (error) {
    console.error("加载Redis数据失败:", error);
    chartError.value = "数据加载失败";
  }
};

onMounted(() => {
  loadRedisData();
});
</script>

<style lang="scss" scoped>
// 全局样式变量
:root {
  --art-main-bg-color: #f5f7fa;
  --custom-radius: 8px;
  --card-spacing: 20px;
}

.redis-monitor {
  // padding: 20px;

  .mb-20 {
    margin-bottom: 20px;
  }

  .mt-10 {
    margin-top: 10px;
  }

  .chart-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #303133;
  }

  .chart-container {
    height: 400px;
    width: 100%;
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
    height: 140px;
    padding: 0 18px;
    list-style: none;
    transition: all 0.3s ease;
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;

    $icon-size: 52px;

    .metric-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .metric-text {
        flex: 1;
        text-align: left;

        .metric-title {
          font-size: 16px;
          color: #909399;
          margin-bottom: 10px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .metric-desc {
          font-size: 14px;
          color: #909399;
        }
      }

      .iconfont-sys {
        width: $icon-size;
        height: $icon-size;
        overflow: hidden;
        font-size: 22px;
        line-height: $icon-size;
        color: var(--el-color-primary) !important;
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 12px;
      }
    }
  }
}

// 图表卡片样式
.chart-card,
.table-card {
  border-radius: var(--custom-radius) !important;
}

// 深色模式支持
:deep(.dark) {
  .card-list {
    .art-custom-card {
      .iconfont-sys {
        background-color: #232323 !important;
      }
    }
  }

  :root {
    --art-main-bg-color: #141414;
  }
}
</style>
