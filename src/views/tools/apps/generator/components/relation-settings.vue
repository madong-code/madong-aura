<template>
  <div class="relation-settings">
    <div class="relation-form">
      <el-button type="primary" @click="addEvent(null, -1)">
        {{ $t("tools.generator.code.relation.add_relation") }}
      </el-button>
    </div>

    <el-table :data="localData" border style="width: 100%">
      <el-table-column prop="type" :label="$t('tools.generator.code.relation.type')" width="120">
        <template #default="scope">
          <el-tag :type="getRelationTypeTag(scope.row.type)">
            {{ getRelationTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        :label="$t('tools.generator.code.relation.method_name')"
        width="150"
      />
      <el-table-column prop="app" :label="$t('tools.generator.code.relation.app')" width="120" />
      <el-table-column
        prop="model"
        :label="$t('tools.generator.code.relation.model')"
        width="150"
      />
      <el-table-column
        prop="local_key"
        :label="$t('tools.generator.code.relation.local_key')"
        width="120"
      />
      <el-table-column
        prop="foreign_key"
        :label="$t('tools.generator.code.relation.foreign_key')"
      />
      <el-table-column
        :label="$t('tools.generator.code.relation.operation')"
        width="150"
        fixed="right"
      >
        <template #default="scope">
          <el-button link type="primary" @click="addEvent(scope.row, scope.$index)">
            {{ $t("common.edit") }}
          </el-button>
          <el-button link type="danger" @click="deleteEvent(scope.$index)">
            {{ $t("common.delete") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="
        isEdit
          ? $t('tools.generator.code.relation.edit_relation')
          : $t('tools.generator.code.relation.add_relation')
      "
      width="600px"
      :before-close="handleClose"
    >
      <el-form
        ref="relationFormRef"
        :model="relationForm"
        :rules="relationRules"
        label-width="100px"
      >
        <el-form-item :label="$t('tools.generator.code.relation.type')" prop="type">
          <el-select
            v-model="relationForm.type"
            :placeholder="$t('tools.generator.code.relation.type_placeholder')"
            style="width: 100%"
          >
            <el-option
              v-for="item in relationTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('tools.generator.code.relation.method_name')" prop="name">
          <el-input
            v-model="relationForm.name"
            :placeholder="$t('tools.generator.code.relation.method_name_placeholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('tools.generator.code.relation.app')" prop="app">
          <el-input
            v-model="relationForm.app"
            :placeholder="$t('tools.generator.code.relation.plugin_placeholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('tools.generator.code.relation.model')" prop="model">
          <el-input
            v-model="relationForm.model"
            :placeholder="$t('tools.generator.code.relation.model_placeholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('tools.generator.code.relation.local_key')" prop="local_key">
          <el-input
            v-model="relationForm.local_key"
            :placeholder="$t('tools.generator.code.relation.local_key_placeholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('tools.generator.code.relation.foreign_key')" prop="foreign_key">
          <el-input
            v-model="relationForm.foreign_key"
            :placeholder="$t('tools.generator.code.relation.foreign_key_placeholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">{{ $t("common.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? $t("common.update") : $t("common.confirm") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { $t } from "@/locales";

interface RelationData {
  type: string;
  name: string;
  addon: string;
  model: string;
  local_key: string;
  foreign_key: string;
}

// 接收父组件数据（直接是数组）
const props = defineProps<{
  modelValue: RelationData[];
}>();

// 向父组件提交数据变更
const emit = defineEmits<{
  "update:modelValue": [value: RelationData[]];
}>();

// 本地数据（直接是数组）
const localData = ref<RelationData[]>([]);

// 监听父组件数据变化，确保数据实时回显
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      localData.value = [...newValue];
    }
  },
  { immediate: true, deep: true }
);

// 弹窗相关状态
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentIndex = ref(-1);

// 表单数据
const relationForm = ref<RelationData>({
  type: "",
  name: "",
  addon: "",
  model: "",
  local_key: "",
  foreign_key: "",
});

// 表单验证规则（使用多语言）
const relationRules = {
  type: [
    {
      required: true,
      message: () => $t("tools.generator.code.relation.type_required"),
      trigger: "change",
    },
  ],
  name: [
    {
      required: true,
      message: () => $t("tools.generator.code.relation.method_name_required"),
      trigger: "blur",
    },
  ],
  model: [
    {
      required: true,
      message: () => $t("tools.generator.code.relation.model_required"),
      trigger: "blur",
    },
  ],
  local_key: [
    {
      required: true,
      message: () => $t("tools.generator.code.relation.local_key_required"),
      trigger: "blur",
    },
  ],
  foreign_key: [
    {
      required: true,
      message: () => $t("tools.generator.code.relation.foreign_key_required"),
      trigger: "blur",
    },
  ],
};

// 关联类型选项（使用多语言）
const relationTypeOptions = computed(() => [
  {
    value: "one_to_one",
    label: $t("tools.generator.code.relation.type_options.one_to_one"),
  },
  {
    value: "one_to_many",
    label: $t("tools.generator.code.relation.type_options.one_to_many"),
  },
  {
    value: "many_to_many",
    label: $t("tools.generator.code.relation.type_options.many_to_many"),
  },
]);

// 表单引用
const relationFormRef = ref();

// 添加/编辑事件
const addEvent = (row: RelationData | null, index: number) => {
  isEdit.value = row !== null;
  currentIndex.value = index;

  if (row) {
    // 编辑模式，填充表单数据
    relationForm.value = { ...row };
  } else {
    // 新增模式，重置表单
    relationForm.value = {
      type: "",
      name: "",
      addon: "",
      model: "",
      local_key: "",
      foreign_key: "",
    };
  }

  dialogVisible.value = true;
};

// 删除事件
const deleteEvent = (index: number) => {
  // 确保数组已初始化
  if (!localData.value) {
    localData.value = [];
    return;
  }

  ElMessageBox.confirm($t("tools.generator.code.relation.delete_confirm"), $t("common.tip"), {
    confirmButtonText: $t("common.confirm"),
    cancelButtonText: $t("common.cancel"),
    type: "warning",
  })
    .then(() => {
      localData.value.splice(index, 1);
      // 删除后立即更新父级（直接发送数组）
      emit("update:modelValue", [...localData.value]);
      ElMessage.success($t("common.delete_success"));
    })
    .catch(() => {
      // 取消删除
    });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  // 重置表单
  relationForm.value = {
    type: "",
    name: "",
    addon: "",
    model: "",
    local_key: "",
    foreign_key: "",
  };
  relationFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  if (!relationFormRef.value) return;

  try {
    // 验证表单
    const valid = await relationFormRef.value.validate();
    if (!valid) return;

    // 确保数组已初始化
    if (!localData.value) {
      localData.value = [];
    }

    if (isEdit.value && currentIndex.value >= 0) {
      // 编辑模式 - 直接更新数组中的对应项
      localData.value[currentIndex.value] = { ...relationForm.value };
    } else {
      // 新增模式 - 添加到数组
      localData.value.push({ ...relationForm.value });
    }

    // 只在确认时更新父级数据（直接发送数组）
    emit("update:modelValue", [...localData.value]);

    ElMessage.success(
      isEdit.value ? $t("common.update_success") : $t("common.add_success")
    );
    handleClose();
  } catch (error) {
    console.error("表单验证失败:", error);
  }
};

// 获取关联类型标签样式
const getRelationTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    one_to_one: "success",
    one_to_many: "warning",
    many_to_many: "danger",
  };
  return tagMap[type] || "info";
};

// 获取关联类型文本（使用多语言）
const getRelationTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    one_to_one: $t("tools.generator.code.relation.one_to_one"),
    one_to_many: $t("tools.generator.code.relation.one_to_many"),
    many_to_many: $t("tools.generator.code.relation.many_to_many"),
  };
  return textMap[type] || type;
};

// 表单验证方法
const validateForm = () => {
  return new Promise((resolve, reject) => {
    // 确保数组已初始化
    if (!localData.value || localData.value.length === 0) {
      resolve(true);
      return;
    }

    // 检查所有关联关系是否有效
    const isValid = localData.value.every(
      (relation) =>
        relation.type &&
        relation.name &&
        relation.model &&
        relation.local_key &&
        relation.foreign_key
    );

    if (isValid) {
      resolve(true);
    } else {
      ElMessage.warning($t("tools.generator.code.relation.incomplete_setting"));
      reject(new Error("关联关系设置不完整"));
    }
  });
};

// 重置表单
const resetForm = () => {
  localData.value = [];
};

// 获取数据（直接返回数组）
const getData = () => {
  return localData.value;
};

// 设置数据（直接接收数组）
const setData = (data: RelationData[]) => {
  localData.value = [...data];
};

// 暴露方法给父组件
defineExpose({
  validateForm,
  resetForm,
  getData,
  setData,
});
</script>

<style scoped>
.relation-settings {
  padding: 20px;
}

.relation-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
