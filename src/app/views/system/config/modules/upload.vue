<script lang="ts" setup>
  import { useForm } from '@/components/form'
  import { $t } from '@/locales'
  import { ConfigService } from '@/app/api/system/config'
  import { DictEnum } from '@/app/enums'
  import uploadSettingDrawer from './upload-ext-drawer.vue'

  const fieldLink = {
    mode: '上传模式',
    single_limit: '上传大小',
    total_limit: '文件限制',
    nums: '数量限制',
    exclude: '不允许文件类型'
  }

  const [BasicForm, formApi] = useForm({
    labelPosition: 'right',
    labelWidth: '130px',
    inline: false,
    schema: [
      {
        prop: 'mode',
        label: $t('system.config.upload.mode'),
        component: 'ApiDict',
        defaultValue: 'local',
        componentProps: {
          renderType: 'RadioGroup',
          code: DictEnum.SYS_CLOUD_STORAGE,
          isBtn: true
        }
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '1024',
          style: { width: '50%' }
        },
        prop: 'single_limit',
        label: $t('system.config.upload.single_limit')
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '1024',
          style: { width: '50%' }
        },
        prop: 'total_limit',
        label: $t('system.config.upload.total_limit')
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '1',
          style: { width: '50%' }
        },
        prop: 'nums',
        label: $t('system.config.upload.nums')
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '',
          style: { width: '50%' }
        },
        prop: 'exclude',
        label: $t('system.config.upload.exclude')
      }
    ]
  })

  /**
   * 提交表单
   */
  function onSubmit() {
    formApi.validate().then(async (e: any) => {
      const values = {
        group_code: 'setting',
        code: 'upload',
        name: '上传设置',
        content: await formApi.getValues()
      }
      ConfigService.update('upload', values).then(() => {
        ElMessage.success($t('common.operation_success'))
        retrieveData()
      })
    })
  }

  const uploadSettingDrawerRef = ref()

  //更多设置
  const handleSetting = async () => {
    const values = await formApi.getValues()
    uploadSettingDrawerRef.value.show(values)
  }

  /**
   * 获取表单数据
   */
  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('upload')) as any
    await formApi.setValues({ ...record })
  }

  onMounted(async () => {
    retrieveData()
  })
</script>

<template>
  <div content-class="flex flex-col gap-4">
    <BasicForm />
    <el-row class="upload-setting">
      <el-button type="primary" @click="onSubmit">保存</el-button>
      <el-button type="primary" @click="handleSetting">更多设置</el-button>
    </el-row>

    <uploadSettingDrawer ref="uploadSettingDrawerRef" />
  </div>
</template>

<style lang="scss">
  .upload-setting {
    margin-left: 130px;
  }
</style>
