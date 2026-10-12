import type { JSX as VueJSX } from 'vue/jsx';

declare global {
  namespace JSX {
    type Element = VueJSX.Element;
    interface IntrinsicElements extends VueJSX.IntrinsicElements {}
  }
}
