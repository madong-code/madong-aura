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
      fieldName: 'web_open',
      label: $t('system.config.web_site.open'),
      component: 'ApiDict',
      defaultValue: 1,
      componentProps: {
        renderType: 'RadioGroup',
        isBtn: true,
        code: DictEnum.SYS_ENABLED_STATUS,
      },
    },
    {
      fieldName: 'web_url',
      label: $t('system.config.web_site.url'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.web_site.placeholder.url'),
      },
    },
    {
      fieldName: 'web_name',
      label: $t('system.config.web_site.name'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.web_site.placeholder.name'),
      },
    },
    {
      fieldName: 'web_logo',
      label: $t('system.config.web_site.logo'),
      component: 'Avatar',
    },
    {
      fieldName: 'web_network_security',
      label: $t('system.config.web_site.network_security'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.web_site.placeholder.network_security'),
      },
    },
    {
      fieldName: 'web_record_no',
      label: $t('system.config.web_site.record_no'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.web_site.placeholder.record_no'),
      },
    },
    {
      fieldName: 'web_description',
      label: $t('system.config.web_site.description'),
      component: 'Input',
      componentProps: {
        type: 'textarea',
        rows: 4,
        placeholder: $t('system.config.web_site.placeholder.description'),
      },
    },
  ],
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const content = await formApi.getValues();
  await ConfigService.update('web_site_setting', {
    group_code: 'system',
    code: 'web_site_setting',
    name: $t('system.config.web_site.title'),
    content,
  });
  ElMessage.success($t('system.config.save_success'));
}

const retrieveData = async () => {
  const record = (await ConfigService.getByCode('web_site_setting')) as any;
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
