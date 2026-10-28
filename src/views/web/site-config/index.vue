<script setup lang="ts">
  /**
   * 站点设置（web 前台门户）：前台开关 / 站点地址 / 站点信息 / 页脚信息（版权、备案、入口开关）/ 百度统计。
   * 与 ERP 后台管理系统自身的站点信息分离存储：site_setting（系统配置→站点设置） vs web_site_setting（本页）。
   * 会员套餐开关在 Portal付费运营→会员套餐页（portal 插件独占写 membership_enabled）。
   * 后端 SiteConfigController（GET|POST /web/site-config，权限 web:site:read|update）；
   * 存储 sys_config group=default/code=web_site_setting，保存为白名单 merge，不影响同行的 membership_enabled。
   */
  import { onMounted, ref } from 'vue'

  import {
    ElButton,
    ElCard,
    ElDivider,
    ElForm,
    ElFormItem,
    ElInput,
    ElMessage,
    ElSwitch,
    ElTabPane,
    ElTabs
  } from 'element-plus'

  import { ImageSelector } from '#/components/form/components'
  import { Page } from '#/components/page'
  import { $t } from '#/locales'

  import { WebSiteService, type WebSiteConfig } from '#/api/web/site'

  defineOptions({ name: 'WebSiteConfig' })

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
  <Page auto-content-height>
    <div v-loading="loading" class="mx-auto max-w-[760px]">
      <div class="mb-4">
        <h2 class="text-base font-semibold text-[#1F2329]">
          {{ $t('web.site.title') }}
        </h2>
        <p class="mt-1 text-xs text-[#909399]">{{ $t('web.site.subtitle') }}</p>
      </div>

      <ElCard shadow="never" class="rounded-lg border-[#E5E8EF]">
        <ElTabs v-model="activeTab">
          <!-- 站点信息 -->
          <ElTabPane :label="$t('web.site.tabs.site')" name="site">
            <ElForm label-width="120px" class="mt-2">
              <ElFormItem :label="$t('web.site.fields.site_open')">
                <ElSwitch
                  :model-value="form.site_open === 1"
                  @update:model-value="form.site_open = $event ? 1 : 0"
                />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.site_url')">
                <ElInput
                  v-model="form.site_url"
                  maxlength="255"
                  :placeholder="$t('web.site.placeholder.site_url')"
                />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.site_name')">
                <ElInput
                  v-model="form.site_name"
                  maxlength="100"
                  :placeholder="$t('web.site.placeholder.site_name')"
                />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.site_logo')">
                <div class="flex items-start gap-3">
                  <ImageSelector
                    v-model="form.site_logo"
                    accept="image/png,image/jpeg,image/svg+xml"
                    direct-upload
                    size="small"
                  />
                  <span class="mt-1 text-xs leading-5 text-[#909399]">
                    {{ $t('web.site.placeholder.site_logo') }}
                  </span>
                </div>
              </ElFormItem>

              <ElDivider class="!my-5">
                <span class="text-xs text-[#909399]">
                  {{ $t('web.site.group_contact') }}
                </span>
              </ElDivider>
              <ElFormItem :label="$t('web.site.fields.contact_email')">
                <div class="w-full">
                  <ElInput
                    v-model="form.contact_email"
                    maxlength="100"
                    clearable
                    :placeholder="$t('web.site.placeholder.contact_email')"
                  />
                  <p class="mt-1.5 text-xs leading-5 text-[#909399]">
                    {{ $t('web.site.placeholder.contact_email_help') }}
                  </p>
                </div>
              </ElFormItem>
            </ElForm>
          </ElTabPane>

          <!-- 页脚信息 -->
          <ElTabPane :label="$t('web.site.tabs.footer')" name="footer">
            <ElForm label-width="120px" class="mt-2">
              <ElFormItem :label="$t('web.site.fields.site_copyright')">
                <ElInput
                  v-model="form.site_copyright"
                  type="textarea"
                  :rows="2"
                  maxlength="255"
                  show-word-limit
                  :placeholder="$t('web.site.placeholder.site_copyright')"
                />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.site_record_no')">
                <ElInput
                  v-model="form.site_record_no"
                  maxlength="100"
                  :placeholder="$t('web.site.placeholder.site_record_no')"
                />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.site_icp_url')">
                <ElInput
                  v-model="form.site_icp_url"
                  maxlength="255"
                  :placeholder="$t('web.site.placeholder.site_icp_url')"
                />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.site_network_security')">
                <ElInput
                  v-model="form.site_network_security"
                  maxlength="100"
                  :placeholder="$t('web.site.placeholder.site_network_security')"
                />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.site_network_security_url')">
                <ElInput
                  v-model="form.site_network_security_url"
                  maxlength="255"
                  :placeholder="$t('web.site.placeholder.site_network_security_url')"
                />
              </ElFormItem>

              <ElDivider class="!my-5">
                <span class="text-xs text-[#909399]">
                  {{ $t('web.site.group_entry') }}
                </span>
              </ElDivider>
              <ElFormItem :label="$t('web.site.fields.show_apply')">
                <ElSwitch v-model="form.show_apply" />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.show_powered')">
                <ElSwitch v-model="form.show_powered" />
              </ElFormItem>
            </ElForm>
          </ElTabPane>

          <!-- 百度统计 -->
          <ElTabPane :label="$t('web.site.tabs.tongji')" name="tongji">
            <ElForm label-width="120px" class="mt-2">
              <ElFormItem :label="$t('web.site.fields.tongji_enabled')">
                <ElSwitch v-model="form.tongji_enabled" />
              </ElFormItem>
              <ElFormItem :label="$t('web.site.fields.tongji_key')">
                <div class="w-full">
                  <ElInput
                    v-model="form.tongji_key"
                    maxlength="64"
                    clearable
                    :placeholder="$t('web.site.placeholder.tongji_key')"
                  />
                  <p class="mt-1.5 text-xs leading-5 text-[#909399]">
                    {{ $t('web.site.placeholder.tongji_help') }}
                  </p>
                </div>
              </ElFormItem>
            </ElForm>
          </ElTabPane>
        </ElTabs>

        <ElDivider class="!mb-4" />
        <div class="flex justify-end">
          <ElButton type="primary" :loading="saving" @click="save">
            {{ $t('web.site.actions.save') }}
          </ElButton>
        </div>
      </ElCard>
    </div>
  </Page>
</template>
