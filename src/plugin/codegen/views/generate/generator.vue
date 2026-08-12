<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  ElButton,
  ElCard,
  ElMessage,
  ElPageHeader,
  ElTabPane,
  ElTabs,
} from 'element-plus';

import { GeneratorCodeService } from '#/api/app/plugin/codegen';
import { useTabs } from '#/core/composables/use-tabs';
import { $t } from '#/locales';

import BasicSettings from './components/basic-settings.vue';
import FieldSettings from './components/field-settings.vue';
import GenerateConfig from './components/generate-config.vue';
import RelationSettings from './components/relation-settings.vue';

defineOptions({ name: 'CodegenGeneratorEditor' });

const route = useRoute();
const { closeCurrentTab } = useTabs();

const activeName = ref('basic');
const formData = reactive({
  basic: {
    table_name: '',
    table_content: '',
    plugin_name: '',
    module_name: '',
    class_name: '',
  },
  columns: [],
  config: {
    is_delete: 0,
    delete_column_name: '',
    edit_type: 1,
    order_column_name: '',
    order_type: 1,
    parent_menu: '',
    addon_name: '',
    table_column: [],
  },
  relations: [],
});

const handleBasicDataChange = (data: any) => {
  formData.basic = data;
};

const generatorId = ref<null | string>(null);

const back = () => {
  closeCurrentTab();
};

const handleSubmit = async () => {
  try {
    if (!generatorId.value) {
      ElMessage.error($t('codegen.generate.editor.no_id'));
      return;
    }
    await GeneratorCodeService.update(generatorId.value, formData);
    ElMessage.success($t('codegen.generate.editor.save_success'));
  } catch (error) {
    ElMessage.error($t('codegen.generate.editor.save_fail'));
    console.error('提交错误:', error);
  }
};

const handleSync = () => {
  ElMessage.info($t('codegen.generate.editor.sync_info'));
};

const handleDownload = () => {
  ElMessage.info($t('codegen.generate.editor.download_info'));
};

const getRouteParams = () => {
  if (route.params.id) return route.params.id as string;
  if (route.query.id) return route.query.id as string;
  if (route.query.generatorId) return route.query.generatorId as string;
  return null;
};

onMounted(async () => {
  generatorId.value = getRouteParams();
  try {
    if (!generatorId.value) {
      ElMessage.warning($t('codegen.generate.editor.no_id'));
      return;
    }
    const response = await GeneratorCodeService.get(generatorId.value);
    if (response) {
      // 后端返回平铺字段，需映射到嵌套结构
      const {
        table_name,
        table_content,
        module_name,
        class_name,
        plugin_name,
        edit_type,
        order_type,
        parent_menu,
        is_delete,
        delete_column_name,
        order_column_name,
        columns,
        relations,
        ...rest
      } = response;

      formData.basic = {
        table_name,
        table_content,
        module_name,
        class_name,
        plugin_name,
      };
      formData.columns = columns || [];
      formData.config = {
        ...formData.config,
        edit_type,
        order_type,
        parent_menu,
        is_delete,
        delete_column_name,
        order_column_name,
      };
      formData.relations = relations || [];
      Object.assign(formData, rest);
    }
  } catch (error) {
    console.error('加载代码生成配置失败:', error);
    ElMessage.error($t('codegen.generate.editor.load_fail'));
  }
});
</script>

<template>
  <div class="generator-container">
    <div class="header">
      <ElCard class="!border-none" shadow="never">
        <ElPageHeader
          :content="$t('codegen.generate.editor.title')"
          @back="back()"
        />
      </ElCard>
    </div>

    <div class="content">
      <ElCard shadow="never" class="mt-[15px] !border-none">
        <ElTabs v-model="activeName">
          <ElTabPane :label="$t('codegen.generate.editor.basic')" name="basic">
            <BasicSettings
              v-model:model-value="formData.basic"
              @data-change="handleBasicDataChange"
            />
          </ElTabPane>
          <ElTabPane :label="$t('codegen.generate.editor.field')" name="field">
            <FieldSettings v-model:table-column="formData.columns" />
          </ElTabPane>
          <ElTabPane
            :label="$t('codegen.generate.editor.config')"
            name="config"
          >
            <GenerateConfig
              v-model:config-data="formData.config"
              :table-column="formData.columns"
              :basic-data="formData.basic"
            />
          </ElTabPane>
          <ElTabPane
            :label="$t('codegen.generate.editor.relation')"
            name="relation"
          >
            <RelationSettings v-model="formData.relations" />
          </ElTabPane>
        </ElTabs>
      </ElCard>
    </div>

    <div class="footer">
      <div class="fixed-footer-wrap">
        <div class="fixed-footer">
          <ElButton type="primary" @click="handleSubmit">
            {{ $t('codegen.generate.editor.save') }}
          </ElButton>
          <ElButton type="primary" @click="handleSync">
            {{ $t('codegen.generate.editor.sync') }}
          </ElButton>
          <ElButton type="primary" @click="handleDownload">
            {{ $t('codegen.generate.editor.download') }}
          </ElButton>
          <ElButton @click="back">
            {{ $t('codegen.generate.editor.cancel') }}
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generator-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 15px;
  overflow: hidden;
}

.header {
  flex-shrink: 0;
}

.content {
  flex: 1;
  overflow: auto;
}

.footer {
  flex-shrink: 0;
  margin-top: auto;
}

.fixed-footer-wrap {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 15px;
  background: var(--el-bg-color);
  box-shadow: 0 -2px 4px rgb(0 0 0 / 10%);
}

.fixed-footer {
  display: flex;
  gap: 10px;
  justify-content: center;
}

:deep(.el-card__body) {
  padding-left: 30px;
}
</style>
