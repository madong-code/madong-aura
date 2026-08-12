<script setup lang="ts">
import type { CrudApiInstance } from '#/adapter/crud';

import { nextTick, ref } from 'vue';

import { ElMessage, ElTree } from 'element-plus';

import { useVbenForm as useForm } from '#/adapter/form';
import { RoleService } from '#/api/system';
import { useDialog } from '#/components/dialog';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();

const record = ref<any>({});
const crudApi = ref<CrudApiInstance>();
const treeData = ref<any[]>([]);
const treeRef = ref();
const defaultProps = ref({
  children: 'children',
  label: (data: any) => `${data.name}`,
});

const [BasicForm, formApi] = useForm({
  commonConfig: {
    labelWidth: 100,
    labelAlign: 'right',
  },
  showDefaultActions: false,
  schema: [
    {
      fieldName: 'code',
      label: $t('system.role.form.data_scope_form.role_code'),
      component: 'Input',
      defaultValue: '',
      componentProps: { disabled: true },
    },
    {
      fieldName: 'name',
      label: $t('system.role.form.data_scope_form.role_name'),
      component: 'Input',
      componentProps: { disabled: true },
    },
    {
      fieldName: 'data_scope',
      label: $t('system.role.form.data_scope_form.data_permission'),
      component: 'ApiDict',
      componentProps: {
        code: DictEnum.SYS_DATA_PERMISSION,
        onChange: (val: any) => {
          handleScopeChange(val);
        },
      },
    },
    {
      fieldName: 'scopes',
      label: $t('system.role.form.data_scope_form.dept_list'),
      component: 'Input',
      dependencies: {
        triggerFields: ['data_scope'],
        show: (values: any) => values.data_scope === 2,
      },
    },
  ],
} as any);

// 缓存已选中的部门 ID，切换显示时恢复选中状态
const checkedKeys = ref<any[]>([]);

// data_scope 下拉框变化时加载/恢复部门树
async function handleScopeChange(val: any) {
  if (val !== 2) return;
  // 首次使用才加载部门树
  if (treeData.value.length === 0) {
    const deptTree = await RoleService.getScopeDeptTree();
    treeData.value = deptTree;
  }
  // 过滤当前树中不存在的节点
  const allNodeIds = collectAllNodeIds(treeData.value);
  const filteredKeys = checkedKeys.value.filter((id: any) =>
    allNodeIds.includes(id),
  );

  await nextTick();
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(filteredKeys);
  }
}

const [Dialog, dialogApi] = useDialog({
  title: $t('system.role.form.data_scope_form.assign_permission'),
  width: '500',
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  draggable: true,
  async onConfirm() {
    const values = await formApi.getValues();
    let submitKeys: string[] = [];
    if (values.data_scope === 2 && treeRef.value) {
      submitKeys = treeRef.value.getCheckedKeys();
    }
    dialogApi.setState({ confirmLoading: true, loading: true });
    RoleService.updateDataScope(record.value.id, {
      ...values,
      scopes: submitKeys,
    })
      .then(() => {
        ElMessage.success(
          $t('system.role.form.data_scope_form.assign_success'),
        );
        crudApi.value?.refreshCreate();
        emit('success');
        dialogApi.close();
      })
      .finally(() => {
        dialogApi.setState({ confirmLoading: false, loading: false });
      });
  },
});

defineExpose({
  async show({
    data,
    getCrudApi,
  }: {
    data: any;
    getCrudApi: () => CrudApiInstance;
  }) {
    record.value = data;
    dialogApi.setState({
      title: `${$t('system.role.form.data_scope_form.assign_permission')}【${data.name}】`,
    });
    crudApi.value = getCrudApi();
    dialogApi.open();

    await nextTick();
    try {
      const res = await RoleService.get(record.value.id);
      checkedKeys.value = (res.scopes || []).map((item: any) => item.id);

      if (res.data_scope === 2) {
        // 每次打开都重新获取部门树
        treeData.value = await RoleService.getScopeDeptTree();
        const allNodeIds = collectAllNodeIds(treeData.value);
        checkedKeys.value = checkedKeys.value.filter((id: any) =>
          allNodeIds.includes(id),
        );
      }

      formApi.setValues({ ...res });

      // 等待 dependencies.show 渲染字段 + slot 中的 ElTree
      await nextTick();
      await nextTick();
      if (res.data_scope === 2 && treeRef.value) {
        treeRef.value.setCheckedKeys(checkedKeys.value);
      }
    } catch (error) {
      console.error('加载数据出错:', error);
    }
  },
});

function collectAllNodeIds(nodes: any[]): any[] {
  const ids: any[] = [];
  const traverse = (nodeList: any[]) => {
    nodeList.forEach((node) => {
      ids.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return ids;
}
</script>

<template>
  <Dialog>
    <BasicForm>
      <template #scopes>
        <ElTree
          ref="treeRef"
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          :check-strictly="true"
          :default-expand-all="true"
          :highlight-current="false"
          style="
            width: 100%;
            max-height: 320px;
            padding: 8px;
            overflow-y: auto;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
          "
        />
      </template>
    </BasicForm>
  </Dialog>
</template>
