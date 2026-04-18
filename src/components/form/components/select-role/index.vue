<template>
  <div class="select-role">
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
      :title="effectiveModalTitle"
      :width="dialogWidth"
      :show-cancel-button="true"
      :show-confirm-button="true"
      :draggable="true"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <RoleSelectModal
        ref="modalRef"
        :multiple="multiple"
        :value="tempValue"
        @select="handleSelect"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, watch } from "vue";
import { ElSelectV2, ElButton } from "element-plus";
import Dialog from "@/components/dialog/dialog.vue";
import RoleSelectModal from "./role-select-dialog.vue";
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
    dialogWidth: "500px",
    rowKey: "id",
  }
);

// 动态计算默认值
const effectivePlaceholder = computed(
  () => props.placeholder || $t("select-role.placeholder.default")
);
const effectiveButtonText = computed(
  () => props.buttonText || $t("select-role.modal.button")
);
const effectiveModalTitle = computed(
  () => props.modalTitle || $t("select-role.modal.title")
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
    return props.value || "";
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
    tempValue.value = values.map((v) => String(v));
    loadRoleNames(values);
  } else {
    tempValue.value = [];
    options.value = [];
  }
};

const loadRoleNames = async (values: string[]) => {
  if (!values || values.length === 0) {
    options.value = [];
    return;
  }

  try {
    const { RoleService } = await import("@/api/system/role/role");
    const response = await RoleService.list();
    const roles = Array.isArray(response)
      ? response
      : response?.items || response?.list || [];
    const roleMap = new Map<string, string>();

    roles.forEach((role: any) => {
      roleMap.set(String(role[props.rowKey]), role.name);
    });

    options.value = values
      .filter((v) => roleMap.has(v))
      .map((v) => ({
        label: roleMap.get(v) || v,
        value: v,
      }));
  } catch (error) {
    console.error("加载角色名称失败:", error);
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

defineExpose({
  getValue() {
    return selectValue.value;
  },
});
</script>

<style lang="scss" scoped>
.select-role {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
