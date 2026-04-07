<template>
  <Dialog>
    <div class="p-5">
      <el-form
        :model="localFormData"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
      >
        <el-form-item :label="$t('setting.config.common.form.label.name')" prop="name">
          <el-input v-model="localFormData.name" :placeholder="$t('setting.config.common.form.placeholder.name')" />
        </el-form-item>
        <el-form-item :label="$t('setting.config.common.form.label.code')" prop="code">
          <el-input
            v-model="localFormData.code"
            :placeholder="$t('setting.config.common.form.placeholder.code')"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t('setting.config.common.form.label.group_code')" prop="group_code">
          <el-select
            v-model="localFormData.group_code"
            :placeholder="$t('setting.config.common.form.placeholder.group_code')"
            style="width: 200px"
          >
            <el-option :label="$t('setting.config.common.form.group_code_options.common')" value="common" />
            <el-option :label="$t('setting.config.common.form.group_code_options.system')" value="system" />
            <el-option :label="$t('setting.config.common.form.group_code_options.site')" value="site" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('setting.config.common.form.label.content_type')" prop="contentType">
          <el-radio-group v-model="localFormData.contentType">
            <el-radio :value="'json'">{{ $t('setting.config.common.form.content_type_options.json') }}</el-radio>
            <el-radio :value="'string'">{{ $t('setting.config.common.form.content_type_options.string') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- JSON Key-Value 编辑器 -->
        <el-form-item
          v-if="localFormData.contentType === 'json'"
          :label="$t('setting.config.common.form.label.kv_config')"
          prop="content"
        >
          <div class="kv-editor">
            <div v-for="(kv, index) in jsonKvList" :key="index" class="kv-item">
              <div class="kv-item-row">
                <el-input v-model="kv.key" :placeholder="$t('setting.config.common.form.placeholder.key')" class="kv-input kv-key" />
                <el-select v-model="kv.type" class="kv-select">
                  <el-option :label="$t('setting.config.common.form.type_options.string')" value="string" />
                  <el-option :label="$t('setting.config.common.form.type_options.number')" value="number" />
                  <el-option :label="$t('setting.config.common.form.type_options.boolean')" value="boolean" />
                </el-select>
              </div>

              <!-- 值输入：根据类型显示不同控件 -->
              <div class="kv-item-row">
                <el-input
                  v-if="kv.type === 'string'"
                  v-model="kv.value"
                  :placeholder="$t('setting.config.common.form.placeholder.string_value')"
                  class="kv-input"
                />
                <el-input-number
                  v-else-if="kv.type === 'number'"
                  v-model="kv.value"
                  :controls="false"
                  class="kv-input"
                  :placeholder="$t('setting.config.common.form.placeholder.number_value')"
                />
                <el-switch
                  v-else-if="kv.type === 'boolean'"
                  v-model="kv.value"
                  class="kv-switch"
                />

                <el-button
                  type="danger"
                  :icon="Delete"
                  @click="removeKvItem(index)"
                  class="kv-delete-btn"
                  circle
                />
              </div>
            </div>
            <el-button type="primary" @click="addKvItem" class="kv-add-btn">
              <el-icon><Plus /></el-icon>
              {{ $t('setting.config.common.form.kv_add') }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 字符串输入 -->
        <el-form-item v-if="localFormData.contentType === 'string'" :label="$t('setting.config.common.form.label.config_content')">
          <el-input
            v-model="contentString"
            type="textarea"
            :rows="8"
            :placeholder="$t('setting.config.common.form.placeholder.config_content')"
          />
        </el-form-item>

        <el-form-item :label="$t('setting.config.common.form.label.remark')" prop="remark">
          <el-input
            v-model="localFormData.remark"
            type="textarea"
            :rows="3"
            :placeholder="$t('setting.config.common.form.placeholder.remark')"
          />
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<script setup lang="tsx">
import { ref } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import { useDialog } from "@/components/dialog";
import { CrudMethods } from "@/components/crud";
import ConfigService from "@/api/setting/config/config";
import { $t } from '@/locales'
import { ElMessage } from 'element-plus';

// 接口定义
interface ConfigItem {
  id?: number;
  name: string;
  code: string;
  content: any;
  remark: string;
  enabled: boolean;
  group_code: string;
  contentType?: "json" | "string";
}

interface KvItem {
  key: string;
  value: any;
  type: "string" | "number" | "boolean";
}

const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const isEdit = ref(false);
const formRef = ref();
const contentString = ref("");

// 本地表单数据
const localFormData = ref<ConfigItem>({
  name: "",
  code: "",
  content: {},
  remark: "",
  enabled: true,
  group_code: "common",
  contentType: "json",
});

// JSON Key-Value 编辑器相关
const jsonKvList = ref<KvItem[]>([{ key: "", value: "", type: "string" }]);

const formRules = {
  name: [{ required: true, message: $t('setting.config.common.form.rules.name_required'), trigger: "blur" }],
  code: [
    { required: true, message: $t('setting.config.common.form.rules.code_required'), trigger: "blur" },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: $t('setting.config.common.form.rules.code_pattern'),
      trigger: "blur",
    },
  ],
};

const [Dialog, dialogApi] = useDialog({
  title: $t('setting.config.common.form.modal.title.create'),
  width: "800px",
  onConfirm() {
    return handleConfirm();
  },
});

// 解析 content 并初始化表单
const parseContent = (data: any) => {
  // 解析 content:后端返回的是 JSON 字符串
  let parsedContent: any;
  try {
    parsedContent =
      typeof data.content === "string" ? JSON.parse(data.content) : data.content;
  } catch {
    parsedContent = data.content;
  }

  // 判断 content 类型
  if (typeof parsedContent === "object" && parsedContent !== null) {
    // JSON 对象类型
    localFormData.value.contentType = "json";
    jsonKvList.value = Object.entries(parsedContent).map(([key, value]) => ({
      key,
      value,
      type:
        typeof value === "number"
          ? "number"
          : typeof value === "boolean"
          ? "boolean"
          : "string",
    }));
  } else {
    // 字符串类型
    localFormData.value.contentType = "string";
    contentString.value = String(parsedContent || "");
    jsonKvList.value = [{ key: "", value: "", type: "string" }];
  }
};

// 提交配置
const handleConfirm = async () => {
  try {
    await formRef.value.validate();

    let content: any;

    // 根据内容类型处理
    if (localFormData.value.contentType === "json") {
      // JSON 对象类型：将 Key-Value 列表转换为 JSON 对象
      const jsonObj: Record<string, any> = {};

      // 过滤有效行（key不为空）
      const validItems = jsonKvList.value.filter((item) => item.key.trim());

      for (const item of validItems) {
        // 根据类型转换值
        if (item.type === "number") {
          jsonObj[item.key] = Number(item.value);
        } else if (item.type === "boolean") {
          jsonObj[item.key] = Boolean(item.value);
        } else {
          jsonObj[item.key] = String(item.value);
        }
      }

      content = jsonObj;
    } else {
      // 字符串类型
      content = contentString.value;
    }

    const payload = {
      group_code: localFormData.value.group_code,
      code: localFormData.value.code,
      name: localFormData.value.name,
      content,
      remark: localFormData.value.remark,
      enabled: localFormData.value.enabled ? 1 : 0,
    };

    dialogApi.setState({
      confirmLoading: true,
      loading: true,
    });

    if (isEdit.value) {
      await ConfigService.update(localFormData.value.code, payload);
      ElMessage.success($t('setting.config.common.form.message.update_success'));
      crudApi.value?.refreshUpdate();
    } else {
      await ConfigService.save(payload);
      ElMessage.success($t('setting.config.common.form.message.create_success'));
      crudApi.value?.refreshCreate();
    }

    dialogApi.close();
    return Promise.resolve();
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message);
    }
    return Promise.reject(error);
  } finally {
    dialogApi.setState({
      confirmLoading: false,
      loading: false,
    });
  }
};

// 添加 Key-Value 项
const addKvItem = () => {
  jsonKvList.value.push({ key: "", value: "", type: "string" });
};

// 移除 Key-Value 项
const removeKvItem = (index: number) => {
  jsonKvList.value.splice(index, 1);
};

defineExpose({
  show({
    data,
    isEdit: edit,
    getCrudApi,
  }: {
    data?: any;
    isEdit?: boolean;
    getCrudApi: () => CrudMethods;
  }) {
    isEdit.value = edit || false;
    crudApi.value = getCrudApi();

    if (edit && data) {
      // 编辑模式
      record.value = data;
      dialogApi.setState({
        title: $t('setting.config.common.form.modal.title.update'),
      });
      localFormData.value = { ...data };
      parseContent(data);
    } else {
      // 新增模式
      dialogApi.setState({
        title: $t('setting.config.common.form.modal.title.create'),
      });
      localFormData.value = {
        name: "",
        code: "",
        content: {},
        remark: "",
        enabled: true,
        group_code: "common",
        contentType: "json",
      };
      contentString.value = "";
      jsonKvList.value = [{ key: "", value: "", type: "string" }];
    }

    dialogApi.open();
  },
});
</script>

<style lang="scss" scoped>
.kv-editor {
  width: 100%;

  .kv-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #f5f7fa;

    .kv-item-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;

      .kv-input {
        flex: 1;
        min-width: 0;

        &.kv-key {
          flex: 0 0 150px;
        }
      }

      .kv-select {
        flex: 0 0 90px;
      }

      .kv-switch {
        flex: 0 0 auto;
      }

      .kv-delete-btn {
        flex: 0 0 auto;
        margin-left: 8px;
      }
    }
  }

  .kv-add-btn {
    width: 100%;
  }
}
</style>
