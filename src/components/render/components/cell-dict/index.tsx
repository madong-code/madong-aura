/**
 * 单元格字典文本渲染器
 * 根据 dict code 自动加载字典数据，以纯文本形式展示 label
 */
import { defineComponent, onMounted, ref, watch } from 'vue';

import { useDictStore } from '#/store/modules/dict';

const DictTextInner = defineComponent({
  name: 'DictTextInner',
  props: {
    code: { type: String, required: true },
    value: { type: [String, Number], default: '' },
  },
  setup(props) {
    const dictStore = useDictStore();
    const options = ref<{ label: string; value: number | string }[]>([]);

    const loadDict = async () => {
      options.value = await dictStore.getDictByType(props.code);
    };

    onMounted(loadDict);
    watch(() => props.code, loadDict);

    const label = () =>
      options.value.find((item) => item.value === props.value)?.label ??
      String(props.value ?? '');

    return () => <span>{label()}</span>;
  },
});

export const CellDictRenderer = {
  renderTableDefault(
    renderOpts: { attrs?: { code: string } },
    params: { column: { field: string }; row: Record<string, any> },
  ) {
    const { column, row } = params;
    const code = renderOpts?.attrs?.code;
    if (!code) return <span>{row[column.field] ?? ''}</span>;
    return <DictTextInner code={code} value={row[column.field]} />;
  },
};
