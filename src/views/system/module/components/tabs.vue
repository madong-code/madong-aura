<template>
  <div class="px-1 mb-4">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" size="small" ref="tabsRef">
      <el-tab-pane
        v-for="category in categories"
        :key="category.key"
        :label="category.label"
        :name="category.key"
      >
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { moduleCategories } from "./../store";

const emit = defineEmits(["tab-change"]);
const tabsRef = ref();
const categories = moduleCategories;
// 使用categories数组的第一个元素的key作为初始值，确保始终选中第一个选项
const activeTab = ref(categories[0]?.key || "all");

const handleTabClick = (tab: any) => {
  emit("tab-change", tab.props.name);
};

// 组件挂载后触发一次tab-change事件，确保父组件知道默认选中的标签页
onMounted(() => {
  emit("tab-change", activeTab.value);
});

// 监听activeTab变化，确保始终与categories的第一个元素同步
watch(
  categories,
  (newCategories) => {
    if (newCategories.length > 0 && activeTab.value !== newCategories[0].key) {
      activeTab.value = newCategories[0].key;
    }
  },
  { deep: true }
);
</script>
