import type { InputProps } from 'element-plus'

import type { WebSiteConfig } from '#/api/web/site'
import type { ImageSelector } from '#/components/form/components'

import { $t } from '#/locales'

type FieldNamesOfType<Value> = {
  [Key in keyof WebSiteConfig]: WebSiteConfig[Key] extends Value ? Key : never
}[keyof WebSiteConfig]

interface FieldSchema<FieldName extends keyof WebSiteConfig> {
  fieldName: FieldName
  label: string
}

type SiteConfigSchema =
  | (FieldSchema<'site_logo'> & {
      component: 'ImageSelector'
      componentProps: Pick<
        InstanceType<typeof ImageSelector>['$props'],
        'accept' | 'directUpload' | 'size'
      >
      description: string
    })
  | (FieldSchema<'site_open' | FieldNamesOfType<boolean>> & {
      component: 'Switch'
    })
  | (FieldSchema<FieldNamesOfType<string>> & {
      component: 'Input'
      componentProps: Partial<InputProps>
      description?: string
    })
  | {
      component: 'Divider'
      fieldName: 'group_contact' | 'group_entry'
      label: string
    }

interface SiteConfigTabSchema {
  label: string
  name: 'footer' | 'site' | 'tongji'
  schema: SiteConfigSchema[]
}

export function getSiteConfigSchemas(): SiteConfigTabSchema[] {
  return [
    {
      name: 'site',
      label: $t('web.site.tabs.site'),
      schema: [
        {
          fieldName: 'site_open',
          label: $t('web.site.fields.site_open'),
          component: 'Switch'
        },
        {
          fieldName: 'site_url',
          label: $t('web.site.fields.site_url'),
          component: 'Input',
          componentProps: {
            maxlength: 255,
            placeholder: $t('web.site.placeholder.site_url')
          }
        },
        {
          fieldName: 'site_name',
          label: $t('web.site.fields.site_name'),
          component: 'Input',
          componentProps: {
            maxlength: 100,
            placeholder: $t('web.site.placeholder.site_name')
          }
        },
        {
          fieldName: 'site_logo',
          label: $t('web.site.fields.site_logo'),
          component: 'ImageSelector',
          componentProps: {
            accept: 'image/png,image/jpeg,image/svg+xml',
            directUpload: true,
            size: 'small'
          },
          description: $t('web.site.placeholder.site_logo')
        },
        {
          fieldName: 'group_contact',
          label: $t('web.site.group_contact'),
          component: 'Divider'
        },
        {
          fieldName: 'contact_email',
          label: $t('web.site.fields.contact_email'),
          component: 'Input',
          componentProps: {
            maxlength: 100,
            clearable: true,
            placeholder: $t('web.site.placeholder.contact_email')
          },
          description: $t('web.site.placeholder.contact_email_help')
        }
      ]
    },
    {
      name: 'footer',
      label: $t('web.site.tabs.footer'),
      schema: [
        {
          fieldName: 'site_copyright',
          label: $t('web.site.fields.site_copyright'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 2,
            maxlength: 255,
            showWordLimit: true,
            placeholder: $t('web.site.placeholder.site_copyright')
          }
        },
        {
          fieldName: 'site_record_no',
          label: $t('web.site.fields.site_record_no'),
          component: 'Input',
          componentProps: {
            maxlength: 100,
            placeholder: $t('web.site.placeholder.site_record_no')
          }
        },
        {
          fieldName: 'site_icp_url',
          label: $t('web.site.fields.site_icp_url'),
          component: 'Input',
          componentProps: {
            maxlength: 255,
            placeholder: $t('web.site.placeholder.site_icp_url')
          }
        },
        {
          fieldName: 'site_network_security',
          label: $t('web.site.fields.site_network_security'),
          component: 'Input',
          componentProps: {
            maxlength: 100,
            placeholder: $t('web.site.placeholder.site_network_security')
          }
        },
        {
          fieldName: 'site_network_security_url',
          label: $t('web.site.fields.site_network_security_url'),
          component: 'Input',
          componentProps: {
            maxlength: 255,
            placeholder: $t('web.site.placeholder.site_network_security_url')
          }
        },
        {
          fieldName: 'group_entry',
          label: $t('web.site.group_entry'),
          component: 'Divider'
        },
        {
          fieldName: 'show_apply',
          label: $t('web.site.fields.show_apply'),
          component: 'Switch'
        },
        {
          fieldName: 'show_powered',
          label: $t('web.site.fields.show_powered'),
          component: 'Switch'
        }
      ]
    },
    {
      name: 'tongji',
      label: $t('web.site.tabs.tongji'),
      schema: [
        {
          fieldName: 'tongji_enabled',
          label: $t('web.site.fields.tongji_enabled'),
          component: 'Switch'
        },
        {
          fieldName: 'tongji_key',
          label: $t('web.site.fields.tongji_key'),
          component: 'Input',
          componentProps: {
            maxlength: 64,
            clearable: true,
            placeholder: $t('web.site.placeholder.tongji_key')
          },
          description: $t('web.site.placeholder.tongji_help')
        }
      ]
    }
  ]
}
