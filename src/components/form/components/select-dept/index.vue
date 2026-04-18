<template>
  <div class="select-dept">
    <ElSelectV2
      v-model="selectValue"
      :options="options"
      :placeholder="effectivePlaceholder"
      :multiple="multiple"
      :clearable="clearable"
      :disabled="disabled"
      @change="handleChange"
      style="width: 100%"
    >
      <template v-for="(_, slotName) in slots" #[slotName]>
        <slot :name="slotName"></slot>
      </template>
    </ElSelectV2>
    <ElButton
      v-if="showButton"
      type="primary"
      :disabled="disabled"
      @click="handleOpen"
      style="margin-left: 8px"
    >
      {{ effectiveButtonText }}
    </ElButton>
    <Dialog
      ref="dialogRef"
      :draggable="true"
      :title="effectiveModalTitle"
      :width="dialogWidth"
      :show-cancel-button="true"
      :show-confirm-button="true"
      custom-class="m-dialog-footer-between"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <DeptSelectModal
        ref="modalRef"
        :multiple="multiple"
        :value="tempValue"
        :filter-ids="filterIds"
        @select="handleSelect"
      />
      <template #prepend-footer>
        <ElDropdown @command="handleTreeCommand">
          <ElButton size="default">
            {{ $t("select-dept.tree.tree_operation") }}
            <ElIcon class="el-icon--right">
              <ArrowDown />
            </ElIcon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="expand">{{
                $t("select-dept.tree.expand_all")
              }}</ElDropdownItem>
              <ElDropdownItem command="collapse">{{
                $t("select-dept.tree.collapse_all")
              }}</ElDropdownItem>
              <ElDropdownItem v-if="multiple" command="selectAll" :divided="true">
                {{
                  modalRef?.allSelected
                    ? $t("select-dept.tree.cancel_select_all")
                    : $t("select-dept.tree.select_all")
                }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, watch, nextTick } from "vue";
import {
  ElSelectV2,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
} from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import Dialog from "@/components/dialog/dialog.vue";
import DeptSelectModal from "./dept-select-dialog.vue";
import { DeptService } from "@/api/setting/dept/dept";
import type { DeptRow } from "@/api/setting/dept/types";
import { $t } from "@/locales";

interface Option {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    value?: string | string[] | null;
    placeholder?: string;
    multiple?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    showButton?: boolean;
    buttonText?: string;
    modalTitle?: string;
    dialogWidth?: string;
    rowKey?: string;
    filterIds?: string[];
    mustInFilterIds?: boolean;
  }>(),
  {
    value: null,
    placeholder: undefined,
    multiple: true,
    clearable: true,
    disabled: false,
    showButton: true,
    buttonText: undefined,
    modalTitle: undefined,
    dialogWidth: "600px",
    rowKey: "id",
    filterIds: () => [],
    mustInFilterIds: false,
  }
);

// 动态计算默认值
const effectivePlaceholder = computed(
  () => props.placeholder || $t("select-dept.placeholder.default")
);
const effectiveButtonText = computed(
  () => props.buttonText || $t("select-dept.modal.button")
);
const effectiveModalTitle = computed(
  () => props.modalTitle || $t("select-dept.modal.title")
);

const emit = defineEmits<{
  (e: "update:value", value: string | string[] | null): void;
  (e: "change", value: string | string[] | null): void;
  (e: "select", options: Option[], values: string[]): void;
}>();

const slots = useSlots();
const dialogRef = ref();
const modalRef = ref();
const options = ref<Option[]>([]);
const tempValue = ref<string[]>([]);

const selectValue = computed({
  get() {
    if (props.multiple) {
      return Array.isArray(props.value)
        ? props.value
        : props.value
        ? props.value.split(",")
        : [];
    }
    return props.value;
  },
  set(val) {
    const result = props.multiple ? (Array.isArray(val) ? val : []) : val;
    emit("update:value", result);
    emit("change", result);
  },
});

const initValue = () => {
  if (props.value) {
    const values = Array.isArray(props.value) ? props.value : props.value.split(",");
    tempValue.value = values;
    loadDeptNames(values);
  } else {
    tempValue.value = [];
    options.value = [];
  }
};

const loadDeptNames = async (values: string[]) => {
  if (!values || values.length === 0) {
    options.value = [];
    return;
  }

  try {
    const tree = await DeptService.getTree();
    const deptMap = new Map<string, string>();

    const traverse = (nodes: DeptRow[]) => {
      nodes.forEach((node) => {
        const key = String(node[props.rowKey as keyof DeptRow]);
        deptMap.set(key, node.name);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(tree);

    options.value = values
      .filter((v) => deptMap.has(v))
      .map((v) => ({
        label: deptMap.get(v) || v,
        value: v,
      }));
  } catch (error) {
    console.error("加载部门名称失败:", error);
    options.value = values.map((v) => ({ label: v, value: v }));
  }
};

const handleOpen = () => {
  dialogRef.value?.open();
};

const handleConfirm = () => {
  const selected = modalRef.value?.getSelected() || [];
  const values = selected.map((item: any) => String(item[props.rowKey]));
  const opts = selected.map((item: any) => ({
    label: item.name,
    value: String(item[props.rowKey]),
  }));

  options.value = opts;
  const result = props.multiple ? values : values[0] || null;
  emit("update:value", result);
  emit("change", result);
  emit("select", opts, values);

  dialogRef.value?.close();
};

const handleCancel = () => {
  dialogRef.value?.close();
};

const handleTreeCommand = (command: string) => {
  switch (command) {
    case "expand":
      modalRef.value?.handleExpandAll();
      break;
    case "collapse":
      modalRef.value?.handleCollapseAll();
      break;
    case "selectAll":
      modalRef.value?.handleSelectAll();
      break;
  }
};

const handleSelect = (selected: any[]) => {
  tempValue.value = selected.map((item: any) => String(item[props.rowKey]));
};

const handleChange = (value: any) => {
  emit("update:value", value);
  emit("change", value);
};

watch(
  () => props.value,
  () => {
    initValue();
  },
  { immediate: true }
);

watch(
  () => props.filterIds,
  (newFilterIds) => {
    if (!props.mustInFilterIds) return;

    const filterSet = new Set((newFilterIds || []).map((id) => String(id)));

    if (filterSet.size === 0) {
      emit("update:value", props.multiple ? [] : null);
      emit("change", props.multiple ? [] : null);
      return;
    }

    if (props.value) {
      const currentValues = Array.isArray(props.value) ? props.value : [props.value];
      const invalidValues = currentValues.filter((v) => !filterSet.has(String(v)));

      if (invalidValues.length > 0) {
        if (props.multiple) {
          const validValues = currentValues.filter((v) => filterSet.has(String(v)));
          emit("update:value", validValues.length > 0 ? validValues : []);
          emit("change", validValues.length > 0 ? validValues : []);
        } else {
          if (!filterSet.has(String(props.value))) {
            emit("update:value", null);
            emit("change", null);
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);

defineExpose({
  getValue() {
    return selectValue.value;
  },
});
</script>

<style lang="scss" scoped>
.select-dept {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
