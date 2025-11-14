import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/enums'
import { Recordable } from '@/types'
import { Icon } from '@/components/icon'
import { CrontabLogService } from '@/api/dev/crontab'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: CrontabLogService.list,
  dialogTitle: $t('dev.crontab_log.list.title'),
  crudApi: {
    // 新增接口
    add: CrontabLogService.create,
    // 修改接口
    edit: CrontabLogService.update,
    // 删除接口
    remove: CrontabLogService.remove,
    // 详情接口
    view: CrontabLogService.get
  },
  // 使用crud
  useCrud: true,
  // 是否有新增
  hasAdd: false,
  // 是否有删除
  hasRemove: true,
  // 是否有修改
  hasEdit: false,
  // 是否有详情
  hasView: false,
  // 新增权限码
  addAuth: 'dev:crontab_log:create',
  // 删除权限码
  removeAuth: 'dev:crontab_log:delete',
  // 修改权限码
  editAuth: 'dev:crontab_log:update',
  // 详情权限码
  viewAuth: 'dev:crontab_log:read',
  toolbarConfig: {
    fullscreen: false,
    size: false
  },
  // 表格列定义
  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'target',
      label: $t('dev.crontab_log.list.table.columns.target'),
      width: 170
    },
    {
      prop: 'running_time',
      label: $t('dev.crontab_log.list.table.columns.running_time')
    },

    {
      prop: 'return_code',
      label: $t('dev.crontab_log.list.table.columns.return_code'),
      component: 'ApiDict',
      componentProps: {
        code: DictEnum.SYS_OPERATION_RESULT
      }
    },
    {
      prop: 'log',
      label: $t('dev.crontab_log.list.table.columns.log'),
      minWidth: 200,
      formatter(row) {
        // 日志内容
        const logContent = row.log || ''

        // 最大显示长度（超过则截断）
        const MAX_DISPLAY_LENGTH = 100
        const isLongContent = logContent.length > MAX_DISPLAY_LENGTH

        // 截断后的内容（带省略号）
        const displayContent = isLongContent
          ? logContent.substring(0, MAX_DISPLAY_LENGTH) + '...'
          : logContent

        return h(
          'div',
          {
            class: 'log-cell',
            style: {
              // 基础样式
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#f5f7fa',
              cursor: isLongContent ? 'pointer' : 'default',
              maxHeight: '60px',
              overflow: 'hidden',
              position: 'relative'
            },
            on: {
              // 鼠标移入事件
              mouseenter: (e: {
                target: {
                  getBoundingClientRect: () => { (): any; new(): any; top: number; left: number }
                  _tooltip: HTMLDivElement
                }
              }) => {
                if (!isLongContent) return

                // 创建Tooltip元素
                const tooltip = document.createElement('div')
                tooltip.textContent = logContent
                tooltip.style.cssText = `
                  position: absolute;
                  top: ${e.target.getBoundingClientRect().top + window.scrollY - 10}px;
                  left: ${e.target.getBoundingClientRect().left + window.scrollX}px;
                  z-index: 9999;
                  width: 400px;
                  max-height: 300px;
                  padding: 8px;
                  background: #303133;
                  color: #fff;
                  border-radius: 4px;
                  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
                  font-size: 12px;
                  line-height: 1.5;
                  overflow: auto;
                  transform: translateX(-50%);
                  white-space: pre-wrap;
                `

                // 添加到DOM
                tooltip.id = 'log-tooltip'
                document.body.appendChild(tooltip)

                // 存储引用以便移除
                e.target._tooltip = tooltip
              },
              // 鼠标移出事件
              mouseleave: (e: { target: { _tooltip: any } }) => {
                if (!e.target._tooltip) return
                document.body.removeChild(e.target._tooltip)
                delete e.target._tooltip
              }
            }
          },
          displayContent
        )
      }
    },
    // {
    //   prop: 'log',
    //   label: $t('dev.crontab_log.list.table.columns.log'),
    //   formatter(row) {
    //     return 888
    //   }
    // },
    {
      prop: 'created_date',
      minWidth: 140,
      label: $t('dev.crontab_log.list.table.columns.created_date')
    }
  ],
  // 搜索表单定义
  searchFormSchema: {
    labelWidth: '200px',
    schema: [
      {
        component: 'Input',
        prop: 'LIKE_target',
        label: $t('dev.crontab_log.list.query.target'),
        componentProps: {
          placeholder: $t('dev.crontab_log.list.query.placeholder.target'),
          clearable: true
        },
        colSpan: 6
      },
      {
        component: 'ApiDict',
        prop: 'return_code',
        label: $t('dev.crontab_log.list.query.return_code'),
        componentProps: {
          placeholder: $t('dev.crontab_log.list.query.placeholder.return_code'),
          code: DictEnum.SYS_OPERATION_RESULT,
          clearable: true
        },
        colSpan: 6
      }
    ]
  },
  // 内置弹窗配置
  dialogProps: {},
  // crud表单配置
  formSchema: {}
}
