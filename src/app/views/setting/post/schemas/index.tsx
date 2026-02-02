import { CrudSchema } from '@/components/crud'
import { PostService } from '@/app/api/setting/post'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import { Recordable } from '@/types'
import { Icon } from '@/components/icon'
import { DeptService } from '@/app/api/setting/dept'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: PostService.list,
    dialogTitle: '岗位',
    crudApi: {
      // 新增接口
      add: PostService.create,
      // 修改接口
      edit: PostService.update,
      // 删除接口
      remove: PostService.remove,
      // 详情接口
      view: PostService.get
    },
    // 使用crud
    useCrud: true,
    // 是否有新增
    hasAdd: true,
    // 是否有删除
    hasRemove: true,
    // 是否有修改
    hasEdit: true,
    // 是否有详情
    hasView: true,
    // 新增权限码
    addAuth: 'org:post:create',
    // 删除权限码
    removeAuth: 'org:post:delete',
    // 修改权限码
    editAuth: 'org:post:update',
    // 详情权限码
    viewAuth: 'org:post:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'code',
        label: $t('setting.post.list.table.columns.code')
      },
      {
        prop: 'name',
        label: $t('setting.post.list.table.columns.name')
      },
      {
        prop: 'sort',
        label: $t('setting.post.list.table.columns.sort')
      },
      {
        prop: 'enabled',
        label: $t('setting.post.list.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        }
      },
      {
        prop: 'remark',
        label: $t('setting.post.list.table.columns.remark')
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          prop: 'LIKE_code',
          label: $t('setting.post.list.query.code'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('setting.post.list.query.placeholder.code')
          },
          colSpan: 6
        },
        {
          prop: 'LIKE_name',
          label: $t('setting.post.list.query.name'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('setting.post.list.query.placeholder.name')
          },
          colSpan: 6
        },
        {
          prop: 'EQ_enabled',
          label: $t('setting.post.list.query.enabled'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            placeholder: $t('setting.post.list.query.placeholder.enabled')
          },
          colSpan: 6
        }
      ]
    },
    // 内置弹窗配置
    dialogProps: {
      width: '50%'
    },
    // crud表单配置
    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('setting.post.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          component: 'ApiTreeSelect',
          componentProps: {
            api: '/system/dept',
            params: { format: 'tree' },
            class: 'w-full',
            filterTreeNode(input: string, node: Recordable<any>) {
              if (!input || input.length === 0) {
                return true
              }
              const name: string = node.label ?? ''
              if (!name) return false
              return name.includes(input) || $t(name).includes(input)
            },
            labelField: 'name',
            showSearch: true,
            treeDefaultExpandAll: true,
            valueField: 'id',
            childrenField: 'children',
            alwaysLoad: false,
            placeholder: $t('setting.post.form.modal.placeholder.dept_name')
          },
          prop: 'dept_id',
          label: $t('setting.post.form.modal.dept_name'),
          renderComponentContent() {
            return {
              title({ label, icon }: { label: string; icon: string }) {
                const coms = []
                if (!label) return ''
                if (icon && icon !== '') {
                  coms.push(h(Icon, { class: 'size-4', icon: icon }))
                }
                coms.push(h('span', { class: '' }, $t(label || '')))
                return h('div', { class: 'flex items-center gap-1' }, coms)
              }
            }
          }
        },

        {
          label: $t('setting.post.form.modal.name'),
          prop: 'name',
          component: 'Input',
          rules: [
            {
              required: true,
              message: $t('setting.post.form.modal.placeholder.name')
            }
          ],
          componentProps: {
            placeholder: $t('setting.post.form.modal.placeholder.name')
          },
          colSpan: 24
        },
        {
          label: $t('setting.post.form.modal.code'),
          prop: 'code',
          component: 'Input',
          rules: [
            {
              required: true,
              message: $t('setting.post.form.modal.placeholder.code')
            }
          ],
          componentProps: {
            placeholder: $t('setting.post.form.modal.placeholder.code')
          },
          colSpan: 24
        },
        {
          label: $t('setting.post.form.modal.sort'),
          prop: 'sort',
          component: 'InputNumber',
          componentProps: {
            min: 0
          },
          colSpan: 24
        },
        {
          label: $t('setting.post.form.modal.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup'
          },
          rules: [],
          colSpan: 24
        },
        {
          label: $t('setting.post.form.modal.remark'),
          prop: 'remark',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            placeholder: $t('setting.post.form.modal.placeholder.remark')
          },
          colSpan: 24
        }
      ]
    }
  }
}
