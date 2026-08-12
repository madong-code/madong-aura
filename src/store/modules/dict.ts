import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

interface NewOption {
  label: string;
  value: number | string;
  disabled?: boolean;
  bgColor?: string;
  textColor?: string;
}

interface DictState {
  dictMap: Map<string, NewOption[]>;
  loadingMap: Map<string, boolean>;
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: new Map<string, NewOption[]>(),
    loadingMap: new Map<string, boolean>(),
  }),

  actions: {
    async getDictByType(dictType: string): Promise<NewOption[]> {
      if (this.dictMap.has(dictType)) {
        return this.dictMap.get(dictType) || [];
      }

      if (this.loadingMap.get(dictType)) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return this.getDictByType(dictType);
      }

      this.loadingMap.set(dictType, true);

      try {
        const res = await requestClient.get('/system/dict/options/by-type', {
          params: { dict_type: dictType },
        });
        const data = res || [];
        this.dictMap.set(dictType, data);
        return data;
      } finally {
        this.loadingMap.set(dictType, false);
      }
    },

    clearDictCache(dictType: string) {
      this.dictMap.delete(dictType);
      this.loadingMap.delete(dictType);
    },

    clearAllCache() {
      this.dictMap.clear();
      this.loadingMap.clear();
    },
  },
});

export type { NewOption };
