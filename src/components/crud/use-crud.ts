import type { CrudApiInstance, CrudSchema } from './types';

import { defineComponent, h, ref } from 'vue';

import CrudComponent from './crud.vue';

export function useCrud(crudSchema: CrudSchema) {
  const crudRef = ref<any>(null);

  const crudApi = {
    query(params?: Record<string, any>) {
      return crudRef.value?.query(params);
    },
    reload(params?: Record<string, any>) {
      return crudRef.value?.reload(params);
    },
    setLoading(loading) {
      crudRef.value?.setLoading(loading);
    },
    getGridInstance() {
      return crudRef.value?.getGridInstance();
    },
    getFormApi() {
      return crudRef.value?.getFormApi();
    },
    getRowSelection() {
      return crudRef.value?.getRowSelection();
    },
    getReadonlyState() {
      return crudRef.value?.getReadonlyState();
    },

    refreshData() {
      crudRef.value?.refreshData();
    },
    refreshSoft() {
      crudRef.value?.refreshSoft();
    },
    refreshCreate() {
      crudRef.value?.refreshCreate();
    },
    refreshUpdate() {
      crudRef.value?.refreshUpdate();
    },
    refreshRemove() {
      crudRef.value?.refreshRemove();
    },

    openAddDialog(data?: Record<string, any>) {
      crudRef.value?.openAddDialog(data);
    },
    openEditDialog(row) {
      crudRef.value?.openEditDialog(row);
    },
    openViewDialog(row) {
      crudRef.value?.openViewDialog(row);
    },

    removeByApi(row) {
      crudRef.value?.removeByApi(row);
    },
    executeRemove(row) {
      crudRef.value?.executeRemove(row);
    },
    executeBatchRemove() {
      crudRef.value?.executeBatchRemove();
    },
    setGridOptions(options: Record<string, any>) {
      crudRef.value?.setGridOptions(options);
    },
  } as CrudApiInstance;

  const Crud = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          CrudComponent,
          {
            ...attrs,
            crudSchema,
            crudApi,
            onRegister: (instance: any) => {
              crudRef.value = instance;
            },
          },
          slots,
        );
    },
  });

  return [Crud, crudApi] as const;
}
