/**
 * 单元格字典标签渲染器
 * 根据 dict code 自动加载字典数据，以 Tag 形式展示
 */
import { defineComponent, onMounted, ref, watch } from 'vue';

import { ElTag } from 'element-plus';

import { useDictStore } from '#/store/modules/dict';

const DictTagInner = defineComponent({
  name: 'DictTagInner',
  props: {
    code: { type: String, required: true },
    value: { type: [String, Number], default: '' },
    effect: {
      type: String as () => 'dark' | 'light' | 'plain',
      default: 'plain',
    },
  },
  setup(props) {
    const dictStore = useDictStore();
    const options = ref<
      {
        bgColor?: string;
        color?: string;
        label: string;
        textColor?: string;
        value: number | string;
      }[]
    >([]);
    const loading = ref(true);

    const loadDict = async () => {
      loading.value = true;
      try {
        options.value = await dictStore.getDictByType(props.code);
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadDict);
    watch(() => props.code, loadDict);

    const getCssVariableValue = (variable: string): string => {
      const rootStyles = getComputedStyle(document.documentElement);
      return rootStyles.getPropertyValue(variable).trim();
    };

    const hexToRgba = (hex: string, alpha: number = 0.1): string => {
      const hexColor = hex.replace('#', '');
      const r = Number.parseInt(hexColor.slice(0, 2), 16);
      const g = Number.parseInt(hexColor.slice(2, 4), 16);
      const b = Number.parseInt(hexColor.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const currentItem = () =>
      options.value.find((item) => String(item.value) === String(props.value));
    const label = () => currentItem()?.label ?? String(props.value ?? '');

    const getTagStyle = () => {
      const item = currentItem();
      const customColor = item?.color ?? item?.textColor ?? item?.bgColor;

      if (customColor) {
        return {
          color: customColor,
          borderColor: customColor,
          backgroundColor: hexToRgba(customColor, 0.1),
        };
      }

      return {
        color: getCssVariableValue('--foreground'),
        borderColor: getCssVariableValue('--border'),
      };
    };

    return () => {
      if (loading.value) return <span>{String(props.value ?? '')}</span>;
      const style = getTagStyle();

      return (
        <ElTag effect={props.effect as any} size="small" style={style}>
          {label()}
        </ElTag>
      );
    };
  },
});

export const CellDictTagRenderer = {
  renderTableDefault(
    renderOpts: {
      attrs?: { code: string; effect?: 'dark' | 'light' | 'plain' };
    },
    params: { column: { field: string }; row: Record<string, any> },
  ) {
    const { column, row } = params;
    const code = renderOpts?.attrs?.code;
    const effect = renderOpts?.attrs?.effect ?? 'plain';
    if (!code) return <span>{row[column.field] ?? ''}</span>;
    return (
      <DictTagInner code={code} effect={effect} value={row[column.field]} />
    );
  },
};
