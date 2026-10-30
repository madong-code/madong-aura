<script setup lang="ts">
  /**
   * 站点设置（web 前台门户）：前台开关 / 站点地址 / 站点信息 / 页脚信息（版权、备案、入口开关）/ 百度统计。
   * 与 ERP 后台管理系统自身的站点信息分离存储：site_setting（系统配置→站点设置） vs web_site_setting（本页）。
   * 会员套餐开关在 Portal付费运营→会员套餐页（portal 插件独占写 membership_enabled）。
   * 后端 SiteConfigController（GET|POST /web/site-config，权限 web:site:read|update）；
   * 存储 sys_config group=default/code=web_site_setting，保存为白名单 merge，不影响同行的 membership_enabled。
   */
  import type { WebSiteConfig } from '#/api/web/site'

  import { computed, onMounted, ref } from 'vue'

  import { useMediaQuery } from '@vueuse/core'
  import {
    ElButton,
    ElDivider,
    ElForm,
    ElFormItem,
    ElInput,
    ElMessage,
    ElSwitch,
    ElTabPane,
    ElTabs
  } from 'element-plus'

  import { WebSiteService } from '#/api/web/site'
  import { ImageSelector } from '#/components/form/components'
  import { Page } from '#/components/page'
  import { $t } from '#/locales'

  import { getSiteConfigSchemas } from './schemas'

  defineOptions({ name: 'WebSiteConfig' })

  const schemas = computed(getSiteConfigSchemas)

  const form = ref<WebSiteConfig>({
    site_open: 1,
    site_url: '',
    site_name: '',
    site_logo: '',
    contact_email: '',
    site_copyright: '',
    site_record_no: '',
    site_icp_url: 'https://beian.miit.gov.cn/',
    site_network_security: '',
    site_network_security_url: '',
    show_apply: true,
    show_powered: true,
    tongji_enabled: false,
    tongji_key: ''
  })

  const activeTab = ref('site')
  const isSmallScreen = useMediaQuery('(max-width: 639px)')
  const loading = ref(false)
  const saving = ref(false)

  async function loadConfig() {
    loading.value = true
    try {
      Object.assign(form.value, await WebSiteService.getConfig())
    } finally {
      loading.value = false
    }
  }

  async function save() {
    saving.value = true
    try {
      const data = await WebSiteService.saveConfig({ ...form.value })
      Object.assign(form.value, data)
      ElMessage.success($t('web.site.messages.save_success'))
    } finally {
      saving.value = false
    }
  }

  onMounted(loadConfig)
</script>

<template>
  <Page content-class="p-4 md:p-6">
    <div v-loading="loading" class="min-w-0">
      <div class="mb-4">
        <h2 class="text-foreground text-base font-semibold">
          {{ $t('web.site.title') }}
        </h2>
        <p class="text-muted-foreground mt-1 text-xs">
          {{ $t('web.site.subtitle') }}
        </p>
      </div>

      <ElTabs v-model="activeTab">
        <ElTabPane v-for="tab in schemas" :key="tab.name" :label="tab.label" :name="tab.name">
          <ElForm
            label-width="120px"
            :label-position="isSmallScreen ? 'top' : 'right'"
            class="mt-2 w-full lg:w-1/2"
          >
            <template v-for="field in tab.schema" :key="field.fieldName">
              <ElDivider v-if="field.component === 'Divider'" class="!my-5">
                <span class="text-xs text-muted-foreground">
                  {{ field.label }}
                </span>
              </ElDivider>
              <ElFormItem v-else :label="field.label">
                <template v-if="field.component === 'Switch'">
                  <ElSwitch
                    v-if="field.fieldName === 'site_open'"
                    :model-value="form.site_open === 1"
                    @update:model-value="form.site_open = $event ? 1 : 0"
                  />
                  <ElSwitch v-else v-model="form[field.fieldName]" />
                </template>
                <div
                  v-else-if="field.component === 'ImageSelector'"
                  class="flex min-w-0 flex-col items-start gap-3 sm:flex-row"
                >
                  <ImageSelector
                    class="shrink-0"
                    v-model="form[field.fieldName]"
                    v-bind="field.componentProps"
                  />
                  <span class="mt-1 text-xs leading-5 text-muted-foreground">
                    {{ field.description }}
                  </span>
                </div>
                <template v-else-if="field.component === 'Input'">
                  <div v-if="field.description" class="w-full">
                    <ElInput v-model="form[field.fieldName]" v-bind="field.componentProps" />
                    <p class="mt-1.5 text-xs leading-5 text-muted-foreground">
                      {{ field.description }}
                    </p>
                  </div>
                  <ElInput v-else v-model="form[field.fieldName]" v-bind="field.componentProps" />
                </template>
              </ElFormItem>
            </template>
          </ElForm>
        </ElTabPane>
      </ElTabs>

      <ElDivider class="!mb-4" />
      <div class="flex justify-end">
        <ElButton type="primary" :loading="saving" @click="save">
          {{ $t('web.site.actions.save') }}
        </ElButton>
      </div>
    </div>
  </Page>
</template>
