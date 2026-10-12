import { defineComponent, h } from 'vue';

import { ElInput } from 'element-plus';

export const VbenInputPassword = defineComponent({
  name: 'VbenInputPassword',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElInput,
        {
          type: 'password',
          showPassword: true,
          autocomplete: 'off',
          ...attrs,
        },
        slots,
      );
  },
});
