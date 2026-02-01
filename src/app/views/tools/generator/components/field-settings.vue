import { Icon } from '@/components/icon';
<template>
  <div class="field-settings">
    <el-table
      :data="table_column"
      size="large"
      ref="tableRef"
      :key="toggleIndex"
      row-key="column_name"
      @sort-change="handleSortChange"
    >
      <el-table-column
        align="center"
        :label="$t('tools.code.field.operation')"
        width="80"
      >
        <template #default>
          <Icon icon="ant-design:unordered-list-outlined" class="vues-rank" size="20" />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.column_name')"
        prop="column_name"
        min-width="130px"
        sortable="custom"
      />
      <el-table-column
        :label="$t('tools.code.field.column_comment')"
        prop=""
        min-width="220px"
      >
        <template #default="{ row, $index }">
          <el-input
            v-model.trim="row.column_comment"
            :placeholder="$t('tools.code.field.placeholder.column_comment')"
            @blur="handleDataChange"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.column_type')"
        prop="column_type"
        width="100px"
      />
      <el-table-column
        :label="$t('tools.code.field.primary_key')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row, $index }">
          <el-checkbox
            v-model="row.is_pk"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.required')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row, $index }">
          <el-checkbox
            v-model="row.is_required"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.insert')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row, $index }">
          <el-checkbox
            v-model="row.is_insert"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.update')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row, $index }">
          <el-checkbox
            v-model="row.is_update"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.lists')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row, $index }">
          <el-checkbox
            v-model="row.is_lists"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.search')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row, $index }">
          <el-checkbox
            v-model="row.is_search"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.search_method')"
        prop=""
        min-width="170px"
      >
        <template #default="{ row, $index }">
          <div class="flex items-center">
            <el-select
              v-if="row.is_search"
              :placeholder="$t('tools.code.field.placeholder.select')"
              v-model="row.query_type"
              @change="handleDataChange"
            >
              <el-option
                :label="item"
                :value="item"
                v-for="(item, index) in query_type_list"
                :key="index"
              />
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.form_type')"
        prop=""
        min-width="225px"
      >
        <template #default="{ row, $index }">
          <el-select
            class="w-[146px]"
            :placeholder="$t('tools.code.field.placeholder.select')"
            v-model="row.view_type"
            @change="handleViewTypeChange(row, $index)"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in view_type_list"
              :key="index"
            />
          </el-select>
          <el-button
            class="ml-[10px]"
            v-if="['select', 'radio', 'checkbox'].includes(row.view_type)"
            type="primary"
            link
            @click="handleViewTypeSetup(row, $index)"
            >{{ $t("tools.code.field.placeholder.setup") }}</el-button
          >
          <el-button
            class="ml-[10px]"
            v-if="row.view_type === 'number'"
            type="primary"
            link
            @click="handleValidatorSetup(row, $index)"
            >{{ $t("tools.code.field.placeholder.setup") }}</el-button
          >
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tools.code.field.validation_type')"
        prop=""
        min-width="260px"
      >
        <template #default="{ row, $index }">
          <div class="flex items-center">
            <el-select
              class="w-[196px]"
              :placeholder="$t('tools.code.field.placeholder.select')"
              v-model="row.validate_type"
              @change="handleValidatorSetup(row, $index)"
              :disabled="!['input', 'textarea'].includes(row.view_type)"
            >
              <template v-for="(item, index) in verify_type_list" :key="index">
                <el-option
                  v-if="item.value === 'max'"
                  :value="item.value"
                  :label="$t('tools.code.field.validation.max')"
                />
                <el-option
                  v-else-if="item.value === 'min'"
                  :value="item.value"
                  :label="$t('tools.code.field.validation.min')"
                />
                <el-option
                  v-else-if="item.value === 'between'"
                  :value="item.value"
                  :label="$t('tools.code.field.validation.between')"
                />
                <el-option v-else :label="item.label" :value="item.value" />
              </template>
            </el-select>
            <el-button
              class="ml-[10px]"
              v-if="['max', 'min', 'between'].includes(row.validate_type)"
              type="primary"
              link
              @click="handleValidatorSetup(row, $index)"
              >{{ $t("tools.code.field.placeholder.setup") }}</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@/components/icon";
import Sortable from "sortablejs";

const tableRef = useTemplateRefsList<HTMLElement>();
const toggleIndex = ref(0);
const rowIndex = ref(0);
const sortableInstance = ref<Sortable | null>(null);

interface TableColumnData {
  column_name: string;
  column_comment: string;
  column_type: string;
  is_pk: number;
  is_required: number;
  is_insert: number;
  is_update: number;
  is_lists: number;
  is_search: number;
  query_type: string;
  view_type: string;
  validate_type: string;
}

// Props定义：接收父组件传递的数据
const props = defineProps<{
  table_column: TableColumnData[];
}>();

// Emits定义：向父组件发送数据变更事件
const emit = defineEmits<{
  "update:table_column": [TableColumnData[]];
}>();

// 查询方式列表
const query_type_list = ref([
  "=",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
  "LIKE",
  "NOT LIKE",
  "IN",
  "NOT IN",
  "BETWEEN",
  "NOT BETWEEN",
]);

// 视图类型列表
const view_type_list = ref([
  { label: "输入框", value: "input" },
  { label: "文本域", value: "textarea" },
  { label: "数字框", value: "number" },
  { label: "下拉框", value: "select" },
  { label: "单选框", value: "radio" },
  { label: "复选框", value: "checkbox" },
  { label: "日期选择", value: "date" },
  { label: "日期时间", value: "datetime" },
  { label: "时间选择", value: "time" },
  { label: "开关", value: "switch" },
  { label: "滑块", value: "slider" },
  { label: "评分", value: "rate" },
]);

// 验证类型列表
const verify_type_list = ref([
  { label: "无验证", value: "" },
  { label: "邮箱", value: "email" },
  { label: "手机号", value: "phone" },
  { label: "身份证", value: "id_card" },
  { label: "URL", value: "url" },
  { label: "IP地址", value: "ip" },
  { label: "最大长度", value: "max" },
  { label: "最小长度", value: "min" },
  { label: "长度区间", value: "between" },
  { label: "正则表达式", value: "regex" },
]);

/**
 * 处理数据变更，通知父组件
 */
const handleDataChange = () => {
  // 直接使用props数据，通过emit通知父组件更新
  emit("update:table_column", [...props.table_column]);
};

/**
 * 处理排序变更
 */
const handleSortChange = ({ column, prop, order }: any) => {
  if (order) {
    const sorted_data = [...props.table_column].sort((a: any, b: any) => {
      const aVal = a[prop];
      const bVal = b[prop];
      if (order === "ascending") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    emit("update:table_column", sorted_data);
  }
};

/**
 * 处理验证器设置
 */
const handleValidatorSetup = (row: TableColumnData, index: number) => {
  if (
    ["max", "min", "between"].includes(row.validate_type) ||
    row.view_type === "number"
  ) {
    rowIndex.value = index;
    // 这里可以调用验证器设置组件
    console.log("验证器设置:", row, index);
  }
};

/**
 * 处理视图类型变更
 */
const handleViewTypeChange = (row: TableColumnData, index: number) => {
  if (!["input", "textarea"].includes(row.view_type)) {
    row.validate_type = "";
  }
  if (["select", "radio", "checkbox"].includes(row.view_type)) {
    rowIndex.value = index;
    // 这里可以调用视图类型设置组件
    console.log("视图类型设置:", row, index);
  } else if (row.view_type === "number") {
    handleValidatorSetup(row, index);
  }
  handleDataChange();
};

/**
 * 处理视图类型设置
 */
const handleViewTypeSetup = (row: TableColumnData, index: number) => {
  if (["select", "radio", "checkbox"].includes(row.view_type)) {
    rowIndex.value = index;
    // 这里可以调用视图类型设置组件
    console.log("视图类型设置:", row, index);
  }
};

/**
 * 初始化拖拽排序
 */
const initDragToReorder = () => {
  if (sortableInstance.value) {
    sortableInstance.value.destroy();
    sortableInstance.value = null;
  }

  //@ts-ignore
  const tbody = tableRef?.value?.$el?.querySelector(".el-table__body-wrapper tbody");
  if (!tbody) return;

  sortableInstance.value = Sortable.create(tbody, {
    handle: ".vues-rank",
    animation: 300,
    onEnd({ newIndex, oldIndex }: any) {
      if (newIndex === oldIndex) return;
      const tableData = [...props.table_column];
      const currRow = tableData.splice(oldIndex, 1)[0];
      tableData.splice(newIndex, 0, currRow);
      // 数据变更
      emit("update:table_column", tableData);
      // 强制刷新表格以更新显示顺序
      toggleIndex.value += 1;
    },
  });
};

/**
 * 刷新表格
 */
const refreshTable = () => {
  toggleIndex.value += 1;
  nextTick(() => {
    initDragToReorder();
  });
};

/**
 * 设置数据
 */
const setData = (data: TableColumnData[]) => {
  emit("update:table_column", [...data]);
};

/**
 * 获取数据
 */
const getData = (): TableColumnData[] => {
  return [...props.table_column];
};

// 监听表格数据变化，当数据变化时重新初始化拖拽
watch(
  () => props.table_column,
  () => {
    nextTick(() => {
      initDragToReorder();
    });
  },
  { deep: true }
);

// 监听toggleIndex变化，当表格重新渲染时重新初始化拖拽
watch(toggleIndex, () => {
  nextTick(() => {
    initDragToReorder();
  });
});

// 暴露方法给父组件
defineExpose({
  refreshTable,
  setData,
  getData,
});

onMounted(() => {
  initDragToReorder();
});
</script>

<style scoped>
.field-settings {
  padding: 20px;
}

.field-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
