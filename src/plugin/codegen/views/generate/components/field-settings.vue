<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

import {
  ElButton,
  ElCheckbox,
  ElInput,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
} from 'element-plus';
import Sortable from 'sortablejs';

import { $t } from '#/locales';

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

const props = defineProps<{ tableColumn: TableColumnData[] }>();
const emit = defineEmits<{ 'update:tableColumn': [TableColumnData[]] }>();

const tableRef = ref<InstanceType<typeof ElTable>>();
const toggleIndex = ref(0);
const sortableInstance = ref<null | Sortable>(null);

const query_type_list = ref([
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'LIKE',
  'NOT LIKE',
  'IN',
  'NOT IN',
  'BETWEEN',
  'NOT BETWEEN',
]);

const view_type_list = ref([
  { label: '输入框', value: 'input' },
  { label: '文本域', value: 'textarea' },
  { label: '数字框', value: 'number' },
  { label: '下拉框', value: 'select' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '日期选择', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '时间选择', value: 'time' },
  { label: '开关', value: 'switch' },
  { label: '滑块', value: 'slider' },
  { label: '评分', value: 'rate' },
]);

const verify_type_list = ref([
  { label: '无验证', value: '' },
  { label: '邮箱', value: 'email' },
  { label: '手机号', value: 'phone' },
  { label: '身份证', value: 'id_card' },
  { label: 'URL', value: 'url' },
  { label: 'IP地址', value: 'ip' },
  { label: '最大长度', value: 'max' },
  { label: '最小长度', value: 'min' },
  { label: '长度区间', value: 'between' },
  { label: '正则表达式', value: 'regex' },
]);

const handleDataChange = () => {
  emit('update:tableColumn', [...props.tableColumn]);
};

const handleSortChange = ({ prop, order }: any) => {
  if (!order || !prop) return;
  const sorted = [...props.tableColumn].toSorted((a: any, b: any) => {
    const aVal = a[prop];
    const bVal = b[prop];
    return order === 'ascending'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });
  emit('update:tableColumn', sorted);
};

const handleValidatorSetup = (row: TableColumnData, _index: number) => {
  if (
    ['between', 'max', 'min'].includes(row.validate_type) ||
    row.view_type === 'number'
  ) {
    // 验证器设置逻辑（待实现）
  }
};

const handleViewTypeChange = (row: TableColumnData, index: number) => {
  if (!['input', 'textarea'].includes(row.view_type)) row.validate_type = '';
  if (['checkbox', 'radio', 'select'].includes(row.view_type)) {
    // 视图类型设置逻辑（待实现）
  } else if (row.view_type === 'number') handleValidatorSetup(row, index);
  handleDataChange();
};

const initDragToReorder = () => {
  if (sortableInstance.value) {
    sortableInstance.value.destroy();
    sortableInstance.value = null;
  }
  const tbody = (tableRef.value as any)?.$el?.querySelector(
    '.el-table__body-wrapper tbody',
  );
  if (!tbody) return;
  sortableInstance.value = Sortable.create(tbody, {
    handle: '.drag-handle',
    animation: 300,
    onEnd: ({ newIndex, oldIndex }: any) => {
      if (newIndex === oldIndex) return;
      const tableData = [...props.tableColumn];
      const currRow = tableData.splice(oldIndex, 1)[0];
      if (currRow) {
        tableData.splice(newIndex, 0, currRow);
      }
      emit('update:tableColumn', tableData);
      toggleIndex.value += 1;
    },
  });
};

const refreshTable = () => {
  toggleIndex.value += 1;
  nextTick(() => initDragToReorder());
};

defineExpose({
  refreshTable,
  setData: (data: TableColumnData[]) => {
    emit('update:tableColumn', [...data]);
  },
  getData: () => [...props.tableColumn],
});

watch(
  () => props.tableColumn,
  () => {
    nextTick(() => initDragToReorder());
  },
  { deep: true },
);
watch(toggleIndex, () => {
  nextTick(() => initDragToReorder());
});

onMounted(() => {
  initDragToReorder();
});
</script>

<template>
  <div class="field-settings">
    <ElTable
      :data="tableColumn"
      size="large"
      ref="tableRef"
      :key="toggleIndex"
      row-key="column_name"
      @sort-change="handleSortChange"
    >
      <ElTableColumn
        align="center"
        :label="$t('codegen.generate.field.operation')"
        width="80"
      >
        <template #default>
          <span
            class="drag-handle cursor-grab text-gray-400 hover:text-gray-600 text-lg"
            >⠿</span
          >
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.column_name')"
        prop="column_name"
        min-width="130px"
        sortable="custom"
      />
      <ElTableColumn
        :label="$t('codegen.generate.field.column_comment')"
        prop=""
        min-width="220px"
      >
        <template #default="{ row }">
          <ElInput
            v-model.trim="row.column_comment"
            :placeholder="
              $t('codegen.generate.field.placeholder.column_comment')
            "
            @blur="handleDataChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.column_type')"
        prop="column_type"
        width="100px"
      />
      <ElTableColumn
        :label="$t('codegen.generate.field.primary_key')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row }">
          <ElCheckbox
            v-model="row.is_pk"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.required')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row }">
          <ElCheckbox
            v-model="row.is_required"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.insert')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row }">
          <ElCheckbox
            v-model="row.is_insert"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.update')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row }">
          <ElCheckbox
            v-model="row.is_update"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.lists')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row }">
          <ElCheckbox
            v-model="row.is_lists"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.search')"
        prop=""
        align="center"
        width="65px"
      >
        <template #default="{ row }">
          <ElCheckbox
            v-model="row.is_search"
            :true-label="1"
            :false-label="0"
            @change="handleDataChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.search_method')"
        prop=""
        min-width="170px"
      >
        <template #default="{ row }">
          <ElSelect
            v-if="row.is_search"
            :placeholder="$t('codegen.generate.field.placeholder.select')"
            v-model="row.query_type"
            @change="handleDataChange"
            style="width: 100%"
          >
            <ElOption
              :label="item"
              :value="item"
              v-for="(item, i) in query_type_list"
              :key="i"
            />
          </ElSelect>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.form_type')"
        prop=""
        min-width="225px"
      >
        <template #default="{ row, $index }">
          <ElSelect
            class="w-[146px]"
            :placeholder="$t('codegen.generate.field.placeholder.select')"
            v-model="row.view_type"
            @change="handleViewTypeChange(row, $index)"
          >
            <ElOption
              :label="item.label"
              :value="item.value"
              v-for="(item, i) in view_type_list"
              :key="i"
            />
          </ElSelect>
          <ElButton
            class="ml-[10px]"
            v-if="['select', 'radio', 'checkbox'].includes(row.view_type)"
            type="primary"
            link
            @click="handleViewTypeChange(row, $index)"
          >
            {{ $t('codegen.generate.field.placeholder.setup') }}
          </ElButton>
          <ElButton
            class="ml-[10px]"
            v-if="row.view_type === 'number'"
            type="primary"
            link
            @click="handleValidatorSetup(row, $index)"
          >
            {{ $t('codegen.generate.field.placeholder.setup') }}
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('codegen.generate.field.validation_type')"
        prop=""
        min-width="260px"
      >
        <template #default="{ row, $index }">
          <ElSelect
            class="w-[196px]"
            :placeholder="$t('codegen.generate.field.placeholder.select')"
            v-model="row.validate_type"
            @change="handleValidatorSetup(row, $index)"
            :disabled="!['input', 'textarea'].includes(row.view_type)"
          >
            <template v-for="(item, i) in verify_type_list" :key="i">
              <ElOption
                v-if="item.value === 'max'"
                :value="item.value"
                :label="$t('codegen.generate.field.validation.max')"
              />
              <ElOption
                v-else-if="item.value === 'min'"
                :value="item.value"
                :label="$t('codegen.generate.field.validation.min')"
              />
              <ElOption
                v-else-if="item.value === 'between'"
                :value="item.value"
                :label="$t('codegen.generate.field.validation.between')"
              />
              <ElOption v-else :label="item.label" :value="item.value" />
            </template>
          </ElSelect>
          <ElButton
            class="ml-[10px]"
            v-if="['max', 'min', 'between'].includes(row.validate_type)"
            type="primary"
            link
            @click="handleValidatorSetup(row, $index)"
          >
            {{ $t('codegen.generate.field.placeholder.setup') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<style scoped>
.field-settings {
  padding: 20px;
}

.drag-handle {
  cursor: grab;
}
</style>
