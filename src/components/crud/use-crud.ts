import { CrudMethods, CrudSchema } from '.'
import Crud from './crud.vue'
/**
 *
 * 防止未来重构影响
 *    通过统一的 useCrud 钩子封装，即使内部实现发生重构，外部调用方也不会受到影响
 *    提供稳定的API接口，隔离底层实现细节的变化
 * @param crudSchema
 * @returns
 */
export function useCrud(crudSchema: CrudSchema) {
  const crudRef = ref<any>(null)
  const register = (crudInstance: any) => {
    crudRef.value = crudInstance
  }
  const crudMethods: CrudMethods = {
    // 获取表格实例
    getCrudRef() {
      return crudRef.value
    },
    // 设置组件状态（props）
    setState(state: any) {
      return crudRef.value?.setState(state)
    },
    // 获取组件状态
    getState() {
      return crudRef.value?.getState()
    },
    getRowSelection() {
      return crudRef.value?.getRowSelection()
    },
    // 刷新表格数据，保留当前表单搜索条件
    reload(params?: Record<string, any>) {
      return crudRef.value?.reload(params)
    },
    // 获取只读状态信息
    getReadonlyState() {
      return crudRef.value?.getReadonlyState() || { selection: [] }
    },
    // 通过接口删除行
    removeByApi(row) {
      return crudRef.value?.removeByApi(row)
    },
    // 获取art表格实例，可通过该方法来操作原生的art-table组件
    // 个人建议，可以在该文件上包装一层再暴露给外部使用，如上述的reload方法一样
    getArtTableInstance() {
      return crudRef.value?.getArtTableInstance()
    },
    // 刷新策略
    /** 全量刷新：清空所有缓存，重新获取数据（适用于手动刷新按钮） */
    refreshData() {
      return this.getArtTableInstance()?.refreshData()
    },
    /** 轻量刷新：仅清空当前搜索条件的缓存，保持分页状态（适用于定时刷新） */
    refreshSoft() {
      return this.getArtTableInstance()?.refreshSoft()
    },
    /** 新增后刷新：回到第一页并清空分页缓存（适用于新增数据后） */
    refreshCreate() {
      return this.getArtTableInstance()?.refreshCreate()
    },
    /** 更新后刷新：保持当前页，仅清空当前搜索缓存（适用于更新数据后） */
    refreshUpdate() {
      return this.getArtTableInstance()?.refreshUpdate()
    },
    /** 删除后刷新：智能处理页码，避免空页面（适用于删除数据后） */
    refreshRemove() {
      return this.getArtTableInstance()?.refreshRemove()
    },
    // 打开内置新增表单
    openAddDialog() {
      return this.getCrudRef()?.openAddDialog()
    },
    // 打开内置修改表单
    openEditDialog() {
      return this.getCrudRef()?.openEditDialog()
    },
    // 打开内置详情表单
    openViewDialog() {
      return this.getCrudRef()?.openViewDialog()
    }
  }

  // 创建表单组件的配置
  const CrudComponent = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          Crud,
          {
            ...attrs,
            crudSchema: crudSchema,
            onRegister: register,
            crudMethods: crudMethods
          },
          slots
        )
    }
  })

  return [CrudComponent, crudMethods] as const
}
