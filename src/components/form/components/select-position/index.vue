<template>
  <div class="select-position">
    <ElSelect
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
    </ElSelect>
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
      <PositionSelectModal
        ref="modalRef"
        :multiple="multiple"
        :value="selectValue"
        :dept-ids="props.deptIds"
        @select="handleSelect"
      />
      <template #prepend-footer>
        <ElDropdown @command="handleTreeCommand">
          <ElButton size="default">
            {{ $t("select-position.tree.tree_operation") }}
            <ElIcon class="el-icon--right">
              <ArrowDown />
            </ElIcon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="expand">{{
                $t("select-position.tree.expand_all")
              }}</ElDropdownItem>
              <ElDropdownItem command="collapse">{{
                $t("select-position.tree.collapse_all")
              }}</ElDropdownItem>
              <ElDropdownItem v-if="multiple" command="selectAll" :divided="true">
                {{
                  modalRef?.allSelected
                    ? $t("select-position.tree.cancel_select_all")
                    : $t("select-position.tree.select_all")
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
  ElSelect,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
} from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import Dialog from "@/components/dialog/dialog.vue";
import PositionSelectModal from "./position-select-dialog.vue";
import { PostService } from "@/api/setting/post/post";
import type { PostRow } from "@/api/setting/post/types";
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
    deptIds?: string[];
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
    deptIds: () => [],
  }
);

// 动态计算默认值
const effectivePlaceholder = computed(
  () => props.placeholder || $t("select-position.placeholder.default")
);
const effectiveButtonText = computed(
  () => props.buttonText || $t("select-position.modal.button")
);
const effectiveModalTitle = computed(
  () => props.modalTitle || $t("select-position.modal.title")
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

const hasDeptIdsEver = ref(false);

const selectValue = computed({
  get() {
    if (props.multiple) {
      if (Array.isArray(props.value)) {
        return props.value.map((v) => String(v));
      } else if (props.value) {
        return props.value.split(",").map((v) => String(v));
      } else {
        return [];
      }
    }
    return props.value ? String(props.value) : "";
  },
  set(val) {},
});

const initValue = () => {
  console.log("执行 initValue 函数，props.value:", props.value);
  if (props.value) {
    const values = Array.isArray(props.value) ? props.value : props.value.split(",");
    console.log("初始化 tempValue 为:", values);
    tempValue.value = values;
    loadPositionNames(values);
  } else {
    console.log("初始化 tempValue 为空数组");
    tempValue.value = [];
    options.value = [];
  }
};

const loadPositionNames = async (values: string[]) => {
  if (!values || values.length === 0) {
    options.value = [];
    return;
  }

  try {
    const response = await PostService.list();
    let positions = response;

    // 处理分页数据格式 {items: [...], total: number}
    if (response && typeof response === "object") {
      if (response.items && Array.isArray(response.items)) {
        positions = response.items;
      } else if (response.list && Array.isArray(response.list)) {
        positions = response.list;
      }
    }

    // 确保 positions 是数组
    if (!Array.isArray(positions)) {
      positions = [];
    }

    let filteredPositions = positions;

    // 根据 deptIds 过滤职位
    if (props.deptIds && props.deptIds.length > 0) {
      const deptIdSet = new Set(props.deptIds.map((id) => String(id)));
      filteredPositions = positions.filter((pos: PostRow) =>
        deptIdSet.has(String(pos.dept_id))
      );
    }

    const positionMap = new Map<string, string>();

    filteredPositions.forEach((pos: PostRow) => {
      const key = String(pos[props.rowKey as keyof PostRow]);
      positionMap.set(key, pos.name);
    });

    const validValues = values.filter((v) => positionMap.has(v));
    options.value = validValues.map((v) => ({
      label: positionMap.get(v) || v,
      value: v,
    }));
  } catch (error) {
    console.error("加载职位名称失败:", error);
    options.value = values.map((v) => ({ label: v, value: v }));
  }
};

const handleOpen = () => {
  dialogRef.value?.open();
};

const handleSelect = (selected: any[]) => {
  console.log("Modal 触发的 select 事件，选中的职位:", selected);

  const values = selected.map((item: any) => String(item[props.rowKey]));
  const opts = selected.map((item: any) => ({
    label: item.name,
    value: String(item[props.rowKey]),
  }));

  console.log("构建的 options:", opts);
  options.value = opts;
  const result = props.multiple ? values : values[0] || null;
  console.log("要更新的值:", result);

  // 直接更新 selectValue，确保 ElSelect 组件能够正确显示选中的职位
  if (props.multiple) {
    selectValue.value = values;
  } else {
    selectValue.value = values.length > 0 ? values[0] : "";
  }

  emit("update:value", result);
  emit("change", result);
  emit("select", opts, values);
};

const handleConfirm = () => {
  console.log("点击了确认按钮");
  try {
    // 使用 getSelected 方法获取选中的职位
    const selected = modalRef.value?.getSelected() || [];
    console.log("Modal 中的 getSelected 方法返回的职位:", selected);

    if (selected.length === 0) {
      console.log("没有选中的职位，直接关闭对话框");
      dialogRef.value?.close();
      return;
    }

    const values = selected.map((item: any) => String(item[props.rowKey]));
    const opts = selected.map((item: any) => ({
      label: item.name,
      value: String(item[props.rowKey]),
    }));

    console.log("构建的 options:", opts);
    options.value = opts;
    const result = props.multiple ? values : values[0] || null;
    console.log("要更新的值:", result);

    // 直接更新 selectValue，确保 ElSelect 组件能够正确显示选中的职位
    if (props.multiple) {
      selectValue.value = values;
    } else {
      selectValue.value = values.length > 0 ? values[0] : "";
    }

    emit("update:value", result);
    emit("change", result);
    emit("select", opts, values);

    console.log("关闭对话框");
    dialogRef.value?.close();
  } catch (error) {
    console.error("确认操作失败:", error);
  }
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

const handleChange = (value: any) => {
  console.log("输入框的值变化:", value);
  if (props.multiple) {
    tempValue.value = Array.isArray(value) ? value : value ? value.split(",") : [];
  } else {
    tempValue.value = value ? [String(value)] : [];
  }
  console.log("tempValue 更新为:", tempValue.value);
  emit("update:value", value);
  emit("change", value);
};

watch(
  () => props.value,
  (newValue) => {
    console.log("props.value 变化:", newValue);
    initValue();
  },
  { immediate: true }
);

// 监听 deptIds 变化，重新加载职位数据并过滤职位
watch(
  () => props.deptIds,
  async (newDeptIds) => {
    console.log("部门 IDs 变化:", newDeptIds);

    // 跟踪是否曾经有过 deptIds
    if (newDeptIds && newDeptIds.length > 0) {
      hasDeptIdsEver.value = true;
    }

    // 场景1: 部门被移除（之前有过部门，现在变成空的）→ 清空关联职位
    if ((!newDeptIds || newDeptIds.length === 0) && hasDeptIdsEver.value) {
      console.log("部门被移除，清空关联职位");
      options.value = [];
      tempValue.value = [];
      if (
        props.value &&
        (Array.isArray(props.value) ? props.value.length > 0 : props.value)
      ) {
        const result = props.multiple ? [] : null;
        emit("update:value", result);
        emit("change", result);
      }
      return;
    }

    // 场景2: 有部门限制或有选中职位时，重新加载并过滤职位数据
    if (props.value) {
      const values = Array.isArray(props.value) ? props.value : props.value.split(",");

      // 重新加载职位数据（会根据 deptIds 自动过滤）
      await loadPositionNames(values);

      // 如果有 deptIds 限制，过滤掉不属于当前部门的职位
      if (newDeptIds && newDeptIds.length > 0) {
        const validValues = options.value.map((opt) => opt.value);
        const currentValue = Array.isArray(props.value)
          ? props.value
          : props.value
          ? props.value.split(",")
          : [];
        const filteredValue = currentValue.filter((val) => validValues.includes(val));

        console.log("过滤前的值:", currentValue);
        console.log("过滤后的值:", filteredValue);
        console.log("有效的职位值:", validValues);

        // 如果过滤后的值与当前值不同，才更新值
        if (filteredValue.length !== currentValue.length) {
          const result = props.multiple ? filteredValue : filteredValue[0] || null;
          console.log("要更新的值:", result);
          emit("update:value", result);
          emit("change", result);
        }
      }
    }
  },
  { deep: true }
);

defineExpose({
  getValue() {
    return selectValue.value;
  },
});
</script>

<style lang="scss" scoped>
.select-position {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
