/**
 * CRUD 操作按钮生成逻辑
 *
 * 配置位置说明：
 * - table：统一的表格配置
 *   - table.hasAdd：控制新增按钮
 *   - table.hasBatchRemove：控制批量删除按钮
 *   - table.hasEdit/hasView/hasRemove：控制表格行操作按钮
 *   - table.tree：控制树形结构和新增子节点按钮
 *   - table.pagination：控制分页配置
 *   - table.toolbar：控制工具栏配置
 * - formDialog：控制表单弹窗相关配置
 */

import type { Ref } from 'vue';

import type { ActionItem } from './components/table-action';
import type { CrudSchema } from './components/types';

import { computed } from 'vue';

import { $t } from '#/locales';

// useAction 所需的最小 API 接口
interface UseActionApi {
  executeBatchRemove: () => void;
  executeRemove: (row: any) => void;
}

export function useAction(
  crudSchema: CrudSchema,
  dialogFormRef: Ref<any>,
  crudApi: UseActionApi,
  getSelection?: () => any[],
) {
  // 获取表单弹窗配置
  const formDialogEnabled = computed(() => {
    return crudSchema.formDialog?.enabled !== false;
  });

  // 表格配置
  const tableConfig = computed(() => {
    return {
      hasAdd: crudSchema.hasAdd ?? true,
      hasBatchRemove: crudSchema.hasBatchRemove ?? true,
      hasEdit: crudSchema.hasEdit ?? true,
      hasView: crudSchema.hasView ?? false,
      hasRemove: crudSchema.hasRemove ?? true,
      tree: crudSchema.tree,
    };
  });

  // 是否有选中的数据
  const hasSelection = computed(() => {
    const selection = getSelection ? getSelection() : [];
    return selection.length > 0;
  });

  // toolbarActions：主工具栏按钮（新增、批量删除等）
  const toolbarActions = computed(() => {
    const actions: ActionItem[] = [];

    // 定义默认按钮配置（带 key）
    const defaultActions: ActionItem[] = [];

    if (tableConfig.value.hasAdd && formDialogEnabled.value) {
      defaultActions.push({
        key: 'add',
        label: crudSchema.buttonText?.add || $t('components.crud.action.add'),
        type: 'primary',
        icon: 'ant-design:plus-outlined',
        auth: crudSchema.permissions?.add,
        dialogRef: dialogFormRef,
        dialogParams: {
          type: 'add',
        },
      });
    }

    if (tableConfig.value.hasBatchRemove && formDialogEnabled.value) {
      // 只有当 dropDownToolbarActions 配置了非空数组时，批量删除才移入「更多」下拉
      // 如果 dropDownToolbarActions 是 undefined 或空数组，批量删除显示在工具栏
      const hasDropDownActions =
        crudSchema.dropDownToolbarActions &&
        crudSchema.dropDownToolbarActions.length > 0;
      if (!hasDropDownActions) {
        defaultActions.push({
          key: 'batchRemove',
          label: $t('components.crud.action.batch_delete'),
          type: 'danger',
          icon: 'ant-design:delete-outlined',
          auth: crudSchema.permissions?.remove,
          ifShow: () => hasSelection.value,
          onClick: () => {
            crudApi.executeBatchRemove();
          },
        });
      }
    }

    // 合并逻辑：如果自定义配置中有相同 key，则覆盖默认配置
    const customActions = crudSchema.toolbarActions || [];
    const customKeys = new Set(
      customActions.map((a: any) => a.key).filter(Boolean),
    );

    // 添加默认按钮（排除被自定义覆盖的）
    defaultActions.forEach((action) => {
      if (!customKeys.has(action.key)) {
        actions.push(action);
      }
    });

    // 添加自定义按钮
    actions.push(...customActions);

    return actions;
  });

  const toolbarToolActions = computed(() => {
    const actions: ActionItem[] = [];
    const tc = crudSchema.toolbar;

    if (tc?.export) {
      actions.push({
        label: $t('components.crud.action.export'),
        icon: 'ant-design:download-outlined',
        type: 'primary',
        link: true,
        onClick: () => {},
      });
    }

    if (tc?.print) {
      actions.push({
        label: $t('components.crud.action.print'),
        icon: 'ant-design:printer-outlined',
        type: 'primary',
        link: true,
        onClick: () => {},
      });
    }

    actions.push(...(tc?.tools || []));
    return actions;
  });

  // toolbarTools 下拉菜单中的操作按钮
  const dropDownToolbarActions = computed(() => {
    const actions: ActionItem[] = [];

    // 定义默认按钮配置（带 key）
    const defaultActions: ActionItem[] = [];

    // 检查是否配置了 dropDownToolbarActions 且非空
    const hasDropDownActions =
      crudSchema.dropDownToolbarActions &&
      crudSchema.dropDownToolbarActions.length > 0;

    if (
      tableConfig.value.hasBatchRemove &&
      formDialogEnabled.value &&
      hasDropDownActions
    ) {
      defaultActions.push({
        key: 'batchRemove',
        label: $t('components.crud.action.batch_delete'),
        type: 'danger',
        icon: 'ant-design:delete-outlined',
        auth: crudSchema.permissions?.remove,
        ifShow: () => hasSelection.value,
        onClick: () => {
          crudApi.executeBatchRemove();
        },
      });
    }

    // 如果没有配置 dropDownToolbarActions 或为空数组，直接返回
    if (!hasDropDownActions) {
      return actions;
    }

    // 合并逻辑：如果自定义配置中有相同 key，则覆盖默认配置
    const customActions = crudSchema.dropDownToolbarActions || [];
    const customKeys = new Set(
      customActions.map((a: any) => a.key).filter(Boolean),
    );

    // 添加默认按钮（排除被自定义覆盖的）
    defaultActions.forEach((action) => {
      if (!customKeys.has(action.key)) {
        actions.push(action);
      }
    });

    // 添加自定义按钮
    actions.push(...customActions);

    return actions;
  });

  const tableActions = computed(() => {
    const actions: ActionItem[] = [];

    if (crudSchema.formDialog?.enabled !== false) {
      // 定义默认按钮配置（带 key）
      const defaultActions: ActionItem[] = [];

      if (tableConfig.value.hasView) {
        defaultActions.push({
          key: 'view',
          label:
            crudSchema.buttonText?.view || $t('components.crud.action.view'),
          type: 'primary',
          link: true,
          icon: 'ant-design:eye-outlined',
          auth: crudSchema.permissions?.view,
          dialogRef: dialogFormRef,
          dialogParams() {
            return { type: 'view' };
          },
        });
      }

      if (tableConfig.value.hasEdit) {
        defaultActions.push({
          key: 'edit',
          label:
            crudSchema.buttonText?.edit || $t('components.crud.action.edit'),
          type: 'primary',
          link: true,
          icon: 'ant-design:edit-outlined',
          auth: crudSchema.permissions?.edit,
          dialogRef: dialogFormRef,
          dialogParams: {
            type: 'edit',
          },
        });
      }

      // 合并逻辑：如果自定义配置中有相同 key，则覆盖默认配置
      const customActions = crudSchema.tableActions || [];
      const customKeys = new Set(
        customActions.map((a: any) => a.key).filter(Boolean),
      );

      // 添加默认按钮（排除被自定义覆盖的）
      defaultActions.forEach((action) => {
        if (!customKeys.has(action.key)) {
          actions.push(action);
        }
      });

      // 添加自定义按钮
      actions.push(...customActions);
    }

    return actions;
  });

  const dropDownActions = computed(() => {
    const actions: ActionItem[] = [];

    if (crudSchema.formDialog?.enabled !== false) {
      // 定义默认按钮配置（带 key）
      const defaultActions: ActionItem[] = [];

      // 新增子节点（树形）
      if (tableConfig.value.hasAdd && tableConfig.value.tree) {
        defaultActions.push({
          key: 'addChild',
          label:
            (crudSchema.buttonText?.add || $t('components.crud.action.add')) +
            $t('components.crud.action.add_child'),
          icon: 'ant-design:plus-outlined',
          size: 'small',
          auth: crudSchema.permissions?.add,
          dialogRef: dialogFormRef,
          dialogParams: {
            type: 'add',
            tree: tableConfig.value.tree,
          },
        });
      }

      if (tableConfig.value.hasRemove) {
        defaultActions.push({
          key: 'remove',
          label:
            crudSchema.buttonText?.remove ||
            $t('components.crud.action.delete'),
          type: 'danger',
          icon: 'ant-design:delete-outlined',
          size: 'small',
          auth: crudSchema.permissions?.remove,
          onClick: (_action: any, _record: any) => {
            crudApi.executeRemove(_record);
          },
        });
      }

      // 合并逻辑：如果自定义配置中有相同 key，则覆盖默认配置
      const customActions = crudSchema.dropDownActions || [];
      const customKeys = new Set(
        customActions.map((a: any) => a.key).filter(Boolean),
      );

      // 添加默认按钮（排除被自定义覆盖的）
      defaultActions.forEach((action) => {
        if (!customKeys.has(action.key)) {
          actions.push(action);
        }
      });

      // 添加自定义按钮
      actions.push(...customActions);
    }

    return actions;
  });

  return {
    toolbarActions,
    toolbarToolActions,
    dropDownToolbarActions,
    tableActions,
    dropDownActions,
  };
}
