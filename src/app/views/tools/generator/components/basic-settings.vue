<template>
  <div class="basic-settings">
    <el-form :model="formData" label-width="90px" style="max-width: 450px">
      <el-form-item :label="$t('tools.generator.code.basic.table_name')">
        <el-input
          v-model.trim="formData.table_name"
          disabled
          :placeholder="$t('tools.generator.code.basic.table_name_placeholder')"
          class="input-width"
          maxlength="64"
        >
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('tools.generator.code.basic.description')">
        <el-input
          v-model.trim="formData.table_content"
          clearable
          :placeholder="$t('tools.generator.code.basic.description_placeholder')"
          class="input-width"
          maxlength="64"
          @blur="handleDataChange"
          @input="handleDataChange"
        />
      </el-form-item>
      <el-form-item :label="$t('tools.generator.code.basic.plugin')">
        <el-select
          class="input-width"
          :placeholder="$t('tools.generator.code.basic.plugin_placeholder')"
          v-model="formData.plugin_name"
          filterable
          remote
          clearable
          @change="handleDataChange"
          @clear="handleDataChange"
        >
          <el-option
            :label="item.label"
            :value="item.value"
            v-for="item in pluginList"
            :key="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('tools.generator.code.basic.module_name')">
        <div>
          <el-input
            v-model.trim="formData.module_name"
            clearable
            :placeholder="$t('tools.generator.code.basic.module_name_placeholder')"
            class="input-width"
            @blur="handleModuleNameBlur"
            @input="handleDataChange"
          />
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('tools.generator.code.basic.module_tip_1') }}
          </p>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('tools.generator.code.basic.module_tip_2') }}
          </p>
        </div>
      </el-form-item>
      <el-form-item :label="$t('tools.generator.code.basic.class_name')">
        <div>
          <el-input
            v-model.trim="formData.class_name"
            clearable
            :placeholder="$t('tools.generator.code.basic.class_name_placeholder')"
            class="input-width"
            @blur="handleClassNameBlur"
            @input="handleDataChange"
          />
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('tools.generator.code.basic.class_tip_1') }}
          </p>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('tools.generator.code.basic.class_tip_2') }}
          </p>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
  import { Grid } from '@element-plus/icons-vue'
  import { GeneratorCodeService } from '@/app/api/tools/generator'
  import { debounce } from 'lodash-es'

  interface BasicSettingsData {
    table_name: string
    table_content: string
    plugin_name: string
    module_name: string
    class_name: string
  }

  // Props定义：接收父组件传递的数据
  const props = defineProps<{
    modelValue?: BasicSettingsData
  }>()

  // Emits定义：向父组件发送数据变更事件
  const emit = defineEmits<{
    'update:modelValue': [value: BasicSettingsData]
    'data-change': [value: BasicSettingsData]
  }>()

  const formData = ref<BasicSettingsData>({
    table_name: '',
    table_content: '',
    plugin_name: '',
    module_name: '',
    class_name: ''
  })

  // 插件列表数据
  const pluginList = ref<{ label: string; value: string }[]>([])

  // 防抖的数据变更处理
  const debouncedDataChange = debounce(() => {
    emitDataChange()
  }, 300)

  // 数据变更处理
  const handleDataChange = () => {
    debouncedDataChange()
  }

  // 发送数据变更事件
  const emitDataChange = () => {
    const formattedData = getFormattedData()
    emit('update:modelValue', formattedData)
    emit('data-change', formattedData)
  }

  // 下划线转驼峰命名
  const convert_to_camel_case = (name: string): string => {
    if (!name) return ''
    return name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  // 下划线转帕斯卡命名（首字母大写）
  const convert_to_pascal_case = (name: string): string => {
    if (!name) return ''
    const camel_case = convert_to_camel_case(name)
    return camel_case.charAt(0).toUpperCase() + camel_case.slice(1)
  }

  // 驼峰转下划线命名
  const convert_to_snake_case = (name: string): string => {
    if (!name) return ''
    return name
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
  }

  // 表名称失去焦点时自动转换
  const handleTableNameBlur = () => {
    if (formData.value.table_name) {
      // 确保表名是下划线格式
      formData.value.table_name = convert_to_snake_case(formData.value.table_name)
      handleDataChange()
    }
  }

  // 模块名称失去焦点时自动转换
  const handleModuleNameBlur = () => {
    if (formData.value.module_name) {
      // 确保模块名是下划线格式
      formData.value.module_name = convert_to_snake_case(formData.value.module_name)
      handleDataChange()
    }
  }

  // 类名称失去焦点时自动转换
  const handleClassNameBlur = () => {
    if (formData.value.class_name) {
      // 确保类名是下划线格式
      formData.value.class_name = convert_to_snake_case(formData.value.class_name)
      handleDataChange()
    }
  }

  // 获取格式化后的数据
  const getFormattedData = () => {
    return {
      table_name: formData.value.table_name,
      table_content: formData.value.table_content,
      plugin_name: formData.value.plugin_name,
      module_name: formData.value.module_name,
      class_name: formData.value.class_name,
      // 转换后的命名
      camel_case_name: convert_to_camel_case(formData.value.class_name),
      pascal_case_name: convert_to_pascal_case(formData.value.class_name)
    }
  }

  const handleTableSelected = (data: any) => {
    formData.value.table_name = data.name || ('' as string)
    handleDataChange()
  }

  const getPluginDev = (search?: string) => {
    GeneratorCodeService.getPluginDevList({
      title: search,
      format: 'select'
    }).then((data) => {
      const res = data as { label: string; value: string }[]
      pluginList.value = res
    })
  }

  // 监听父组件数据变化
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        formData.value = { ...formData.value, ...newValue }
      }
    },
    { immediate: true, deep: true }
  )

  // 暴露数据给父组件
  defineExpose({
    getData: () => getFormattedData(),
    setData: (data: Partial<BasicSettingsData>) => {
      formData.value = { ...formData.value, ...data }
      emitDataChange()
    },
    validate: () => {
      // 简单的表单验证
      if (!formData.value.table_name) {
        return { valid: false, message: '请选择数据表' }
      }
      if (!formData.value.module_name) {
        return { valid: false, message: '请输入模块名称' }
      }
      if (!formData.value.class_name) {
        return { valid: false, message: '请输入类名称' }
      }
      return { valid: true }
    }
  })

  onMounted(() => {
    getPluginDev()
  })

  onUnmounted(() => {
    debouncedDataChange.cancel()
  })
</script>

<style scoped>
  .basic-settings {
    padding: 20px;
  }

  .field-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.4;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .basic-settings {
      padding: 15px;
    }

    .el-form-item {
      margin-bottom: 15px;
    }

    .el-row {
      margin: 0 -10px;
    }

    .el-col {
      padding: 0 10px;
    }
  }

  /* 小屏幕适配 */
  @media (max-width: 480px) {
    .basic-settings {
      padding: 10px;
    }

    el-form-item {
      margin-bottom: 12px;
    }
  }
</style>
