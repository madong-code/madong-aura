<script setup lang="ts">
import { onMounted } from 'vue';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { ConfigService } from '#/api/system/config';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

const [BasicForm, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: { labelWidth: 130 },
  schema: [
    {
      fieldName: 'baidu_open',
      label: $t('system.config.baidu_tongji.open'),
      component: 'ApiDict',
      defaultValue: 0,
      componentProps: {
        renderType: 'RadioGroup',
        isBtn: true,
        code: DictEnum.SYS_ENABLED_STATUS,
      },
    },
    {
      fieldName: 'baidu_tongji_code',
      label: $t('system.config.baidu_tongji.code'),
      component: 'Input',
      componentProps: {
        type: 'textarea',
        rows: 8,
        placeholder: $t('system.config.baidu_tongji.placeholder.code'),
      },
    },
  ],
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const content = await formApi.getValues();
  await ConfigService.update('baidu_tongji', {
    group_code: 'system',
    code: 'baidu_tongji',
    name: $t('system.config.baidu_tongji.title'),
    content,
  });
  ElMessage.success($t('system.config.save_success'));
}

const retrieveData = async () => {
  const record = (await ConfigService.getByCode('baidu_tongji')) as any;
  await formApi.setValues({ ...record });
};

onMounted(() => {
  retrieveData();
});
</script>

<template>
  <div>
    <BasicForm />
    <div class="flex justify-end mt-4">
      <ElButton type="primary" @click="onSubmit">
        {{ $t('system.config.save') }}
      </ElButton>
    </div>
  </div>
</template>
