import { DocProjectService } from '@/apps/official/api/doc'
import { DictEnum } from '@/apps/official/enums/dict-enum'
import { CrudSchema } from '@/components/crud'
import { Icon } from '@/components/icon'
import { $t } from '@/locales'
import { h } from 'vue'


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: DocProjectService.list,
    dialogTitle: '文档中心',
    crudApi: {
      // 新增接口
      add: DocProjectService.create,
      // 修改接口
      edit: DocProjectService.update,
      // 删除接口
      remove: DocProjectService.remove,
      // 详情接口
      view: DocProjectService.get
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
    addAuth: 'official:doc:create',
    // 删除权限码
    removeAuth: 'official:doc:delete',
    // 修改权限码
    editAuth: 'official:doc:update',
    // 详情权限码
    viewAuth: 'official:doc:read',
    rowKey: 'id',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        label: '排序',
        prop: 'sort',
        align: 'center'
      },
      {
        prop: 'thumb',
        label: '缩略图',
        formatter: (row: any) => {
          const imageUrl = row.thumb_url || row.thumb
          if (!imageUrl) {
            return h('span', { style: { color: '#999', fontSize: '12px' } }, '无')
          }
          return h('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } }, [
            h('img', {
              src: imageUrl,
              alt: '海报',
              style: {
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid #e8e8e8'
              },
              onClick: () => {
                window.open(imageUrl, '_blank')
              }
            })
          ])
        }
      },
      {
        label: '唯一标识',
        prop: 'code',
        align: 'center'
      },
      {
        label: '标题',
        prop: 'title',
        align: 'center'
      },
      {
        label: '阅读量',
        prop: 'sort',
        align: 'center'
      },
      {
        prop: 'is_show',
        label: '是否显示',
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_YES_NO,
        }
      },
      {
        prop: 'enabled',
        label: '状态',
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS,
        }
      },


    ],
    // 内置弹窗配置
    dialogProps: {
      width: '70%',
      dialogType: 'drawer',
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '120px',
      schema: [
        {
          label: '唯一标识',
          prop: 'code',
          component: 'Input',
          colSpan: 6,
          rules: [],
        },
        {
          prop: 'LIKE_title',
          label: '标题',
          component: 'Input',
          colSpan: 6,
        },


      ]
    },
    // crud表单配置
    formSchema: {
      showDefaultActions: true,
      labelWidth: '130px',
      schema: [
        {
          label: 'ID',
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          prop: 'thumb',
          label: '海报上传',
          component: 'Upload',
          colSpan: 24,
          componentProps: {
            listType: 'picture-card',
            maxCount: 1,
            accept: '.jpg,.jpeg,.png,.webp,.gif',
            maxSize: 5 * 1024 * 1024,
            limit: 1,
          
          }
        },
        {
          label: '唯一编码',
          prop: 'code',
          component: 'Input',
          colSpan: 24,
          rules: [],
        },
        {
          label: '显示名称',
          prop: 'title',
          component: 'Input',
          colSpan: 24,
          rules: [],

        },

        {
          label: '权限管控',
          prop: 'auth_type',
          component: 'ApiDict',
          defaultValue: 0,
          colSpan: 24,
          rules: [],
          componentProps: (_value) => {
            return {
              code: DictEnum.DOC_PERMISSION_TYPE,
            }
          }
        },
        {
          label: '排序',
          prop: 'sort',
          component: 'InputNumber',
          defaultValue: 999,
          colSpan: 24,
          componentProps: {
            clearable: true,
            min: -1
          }
        },
        {
          label: '首页显示',
          prop: 'app',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 12,
          rules: [],
          componentProps: (_value) => {
            return {
              code: DictEnum.SYS_ENABLED_STATUS,
              isBtn: true,
              renderType: 'RadioGroup',
            }
          }
        },
        {
          label: '启用状态',
          prop: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 12,
          rules: [],
          componentProps: (_value) => {
            return {
              code: DictEnum.SYS_ENABLED_STATUS,
              isBtn: true,
              renderType: 'RadioGroup',
            }
          }
        },
        {
          label: '协助分组',
          prop: 'role_ids',
          component: 'ApiSelect',
          defaultValue: '',
          colSpan: 24,
          rules: [],
          componentProps: (_value) => {
            return {
              api: '/system/role',
              requestMethod: 'GET',
              placeholder: '请选择协作分组',
            }

          }
        },
        {
          label: '协作用户',
          prop: 'admin_ids',
          component: 'ApiSelect',
          defaultValue: '',
          colSpan: 24,
          rules: [],
          componentProps: (_value) => {
            return {
              api: '/system/admin',
              requestMethod: 'GET',
              placeholder: '请选择协作用户',
            }

          }
        },
        {
          label: '描述',
          prop: 'desc',
          component: 'Input',
          colSpan: 24,
          defaultValue: '',
          componentProps: {
            rows: 4,
            type: 'textarea',
            clearable: true
          }
        },



      ]
    }
  }
}
