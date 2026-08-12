<script setup lang="ts">
import { onMounted } from 'vue';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { ConfigService } from '#/api/system/config';
import { Page } from '#/components/page';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';
import { useSiteConfigStore } from '#/store/modules/site-config';

import { convertStringNumbers } from '../schemas';

const groupCode = 'default';

const [BasicForm, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    labelWidth: 130,
  },
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      fieldName: 'site_open',
      label: $t('system.config.site.open'),
      component: 'ApiDict',
      defaultValue: 1,
      formItemClass: 'col-span-2',
      componentProps: {
        renderType: 'RadioGroup',
        isBtn: true,
        code: DictEnum.SYS_ENABLED_STATUS,
      },
    },
    {
      fieldName: 'site_url',
      label: $t('system.config.site.url'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.url'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_name',
      label: $t('system.config.site.name'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.name'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_logo',
      label: $t('system.config.site.logo'),
      component: 'Avatar',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {},
    },
    {
      fieldName: 'site_network_security',
      label: $t('system.config.site.network_security'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.network_security'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_keywords',
      label: $t('system.config.site.keywords'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.keywords'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_record_no',
      label: $t('system.config.site.record_no'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.record_no'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_icp_url',
      label: $t('system.config.site.icp_url'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.icp_url'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_network_security_url',
      label: $t('system.config.site.network_security_url'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.network_security_url'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_copyright',
      label: $t('system.config.site.copyright'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.copyright'),
        clearable: true,
      },
    },
    {
      fieldName: 'site_description',
      label: $t('system.config.site.description'),
      component: 'Input',
      formItemClass: 'col-span-2 w-1/2',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.description'),
        clearable: true,
        type: 'textarea',
        rows: 4,
        style: { width: '100%' },
      },
    },
  ],
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  const content = await formApi.getValues();
  const values = {
    group_code: groupCode,
    code: 'site_setting',
    name: $t('system.config.site.title'),
    content,
  };
  await ConfigService.update('site_setting', values);
  // 保存后重新拉取站点配置并同步到 preferences（刷新 logo/标题/favicon）
  // 与登录页共用同一接口与数据源，保证前后展示一致
  const siteConfigStore = useSiteConfigStore();
  await siteConfigStore.syncSitePreferences();
  ElMessage.success($t('system.config.save_success'));
}

const retrieveData = async () => {
  const record = (await ConfigService.getByCode('site_setting')) as any;
  await formApi.setValues(convertStringNumbers(record));
};

onMounted(() => {
  retrieveData();
});
</script>

<template>
  <Page :title="$t('system.config.site.title')" auto-content-height>
    <BasicForm />
    <div class="flex mt-4 ml-[130px]">
      <ElButton type="primary" @click="onSubmit">
        {{ $t('system.config.save') }}
      </ElButton>
    </div>
  </Page>
</template>
