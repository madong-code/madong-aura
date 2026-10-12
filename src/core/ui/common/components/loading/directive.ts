import type { App, Directive, DirectiveBinding } from 'vue';

import { h, render } from 'vue';

import { Loading } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

const SPINNER_INSTANCE_KEY = Symbol('spinner');

const CLASS_NAME_RELATIVE = 'spinner-parent--relative';

/**
 * 全屏/容器旋转遮罩（EP 实现，替代 vben primitives 的 VbenSpinner）
 */
function renderSpinner(binding: DirectiveBinding) {
  const options =
    binding.value === undefined
      ? { spinning: true }
      : typeof binding.value === 'boolean'
        ? { spinning: binding.value }
        : { ...binding.value };

  return h(
    'div',
    {
      class: 'madong-spinning-mask',
      style: {
        position: 'absolute',
        inset: '0',
        display: options.spinning ? 'flex' : 'none',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': '2000',
        'background-color': 'var(--el-mask-color)',
        'border-radius': 'inherit',
      },
    },
    [
      h(
        ElIcon,
        { class: 'is-loading', style: { 'font-size': '24px' } },
        () => h(Loading),
      ),
    ],
  );
}

const spinningDirective: Directive = {
  mounted(el, binding) {
    const instance = h('div', { style: 'display:contents' }, [
      renderSpinner(binding),
    ]);
    render(instance, el);
    const maskEl = el.querySelector('.madong-spinning-mask');
    el[SPINNER_INSTANCE_KEY] = maskEl;
    el.classList.add(CLASS_NAME_RELATIVE);
  },
  unmounted(el) {
    el.classList.remove(CLASS_NAME_RELATIVE);
    const maskEl = el[SPINNER_INSTANCE_KEY];
    if (maskEl?.parentNode) {
      maskEl.parentNode.removeChild(maskEl);
    }
    el[SPINNER_INSTANCE_KEY] = null;
  },
  updated(el, binding) {
    const maskEl = el[SPINNER_INSTANCE_KEY] as HTMLElement | undefined;
    const spinning =
      binding.value === undefined
        ? true
        : typeof binding.value === 'boolean'
          ? binding.value
          : !!binding.value?.spinning;
    if (maskEl) {
      maskEl.style.display = spinning ? 'flex' : 'none';
    }
  },
};

type loadingDirectiveParams = {
  /** 是否注册 loading 指令（art 侧使用 EP 原生 v-loading，通常传 false） */
  loading?: boolean | string;
  /** 是否注册 spinning 指令。如果提供一个 string，则将指令注册为指定的名称 */
  spinning?: boolean | string;
};

/**
 * 注册 loading/spinning 指令
 */
export function registerLoadingDirective(
  app: App,
  params?: loadingDirectiveParams,
) {
  // 注入一个样式供指令使用，确保容器是相对定位
  const style = document.createElement('style');
  style.id = CLASS_NAME_RELATIVE;
  style.innerHTML = `
    .${CLASS_NAME_RELATIVE} {
      position: relative !important;
    }
  `;
  document.head.append(style);
  if (params?.loading !== false) {
    // 默认无 vben loading 实现，由调用方使用 EP 原生 v-loading
    console.warn('[registerLoadingDirective] 请使用 Element Plus 原生 v-loading 指令');
  }
  if (params?.spinning !== false) {
    app.directive(
      typeof params?.spinning === 'string' ? params.spinning : 'spinning',
      spinningDirective,
    );
  }
}
