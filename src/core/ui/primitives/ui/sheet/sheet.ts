import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

export const sheetVariants = cva(
  'bg-background border-border data-[state=closed]:animate-out data-[state=open]:animate-in shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    defaultVariants: {
      side: 'right',
    },
    variants: {
      side: {
        bottom:
          'border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 border-t',
        left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r ',
        right:
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0  w-3/4 border-l',
        top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 border-b',
      },
    },
  },
);

export type SheetVariants = VariantProps<typeof sheetVariants>;
