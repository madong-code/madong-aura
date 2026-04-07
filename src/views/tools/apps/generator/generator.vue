<template>
  <div class="generator-container">
    <!-- 头部区域 -->
    <div class="header">
      <el-card class="card !border-none" shadow="never">
        <el-page-header content="代码生成" @back="back()" />
      </el-card>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <el-card class="box-card mt-[15px] !border-none" shadow="never">
        <el-tabs v-model="activeName">
          <el-tab-pane label="基础设置" name="basic">
            <BasicSettings
              ref="basicRef"
              v-model:modelValue="formData.basic"
              @data-change="handleBasicDataChange"
            />
          </el-tab-pane>
          <el-tab-pane label="字段设置" name="field">
            <FieldSettings ref="fieldRef" v-model:table_column="formData.columns" />
          </el-tab-pane>
          <el-tab-pane label="生成配置" name="config">
            <GenerateConfig
              ref="configRef"
              v-model:config-data="formData.config"
              :table-column="formData.columns"
              :basic-data="formData.basic"
            />
          </el-tab-pane>
          <el-tab-pane label="关联设置" name="relation">
            <RelationSettings ref="relationRef" v-model="formData.relations" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 底部固定区域 -->
    <div class="footer">
      <div class="fixed-footer-wrap">
        <div class="fixed-footer">
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button type="primary" @click="handleSync">同步代码</el-button>
          <el-button type="primary" @click="handleDownload">下载代码</el-button>
          <el-button @click="back">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useWorktabStore } from '@/store/modules/worktab'
  import BasicSettings from './components/basic-settings.vue'
  import FieldSettings from './components/field-settings.vue'
  import GenerateConfig from './components/generate-config.vue'
  import RelationSettings from './components/relation-settings.vue'
  const worktabStore = useWorktabStore()

  const route = useRoute()
  const router = useRouter()

  import { GeneratorCodeService } from '@/api/tools/apps/generator'

  const activeName = ref('basic')

  const formData = reactive({
    basic: {},
    columns: [],
    config: {
      is_delete: 0,
      delete_column_name: '',
      edit_type: 1,
      order_column_name: '',
      order_type: 1,
      parent_menu: '',
      addon_name: '',
      table_column: []
    },
    relations: []
  })

  /**
   *
   * @param data 基础设置更新数据
   */
  const handleBasicDataChange = (data: any) => {
    formData.basic = data
  }

  // 从路由获取ID
  const generatorId = ref<string | null>(null)

  // 组件引用
  const basicRef = ref()
  const fieldRef = ref()
  const configRef = ref()
  const relationRef = ref()

  const back = () => {
    worktabStore.removeTab('/code/generator')
    router.back()
  }

  const handleSubmit = async () => {
    try {
      // 验证所有表单
      // const basicValid = await basicRef.value?.validateForm();
      // const fieldValid = await fieldRef.value?.validateForm();
      // const configValid = await configRef.value?.validateForm();
      // const relationValid = await relationRef.value?.validateForm();

      // if (!basicValid || !fieldValid || !configValid || !relationValid) {
      //   ElMessage.error("请填写完整信息");
      //   return;
      // }
      if (!generatorId.value) {
        ElMessage.error('缺少生成器ID')
        return
      }
      GeneratorCodeService.update(generatorId.value, formData)

      ElMessage.success('保存成功')
      // back();
    } catch (error) {
      ElMessage.error('保存失败')
      console.error('提交错误:', error)
    }
  }

  const handleSync = () => {
    ElMessage.info('同步代码功能开发中')
  }

  const handleDownload = () => {
    ElMessage.info('下载代码功能开发中')
  }

  // 获取路由参数
  const getRouteParams = () => {
    // 优先使用路径参数
    if (route.params.id) {
      return route.params.id as string
    }
    // 其次使用查询参数
    if (route.query.id) {
      return route.query.id as string
    }
    // 还可以支持其他查询参数名称
    if (route.query.generatorId) {
      return route.query.generatorId as string
    }
    return null
  }

  onMounted(async () => {
    generatorId.value = getRouteParams()
    try {
      if (!generatorId.value) {
        ElMessage.warning('缺少生成器ID')
        return
      }
      const response = await GeneratorCodeService.get(generatorId.value)
      if (response) {
        Object.assign(formData, response)
      }
    } catch (error) {
      console.error('加载代码生成配置失败:', error)
      ElMessage.error('加载配置失败')
    }
  })
</script>

<style lang="scss" scoped>
  .generator-container {
    display: flex;
    flex-direction: column;
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
    background: var(--el-bg-color);
    padding: 15px;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .fixed-footer {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  :deep(.el-card__body) {
    padding-left: 30px;
  }
</style>
