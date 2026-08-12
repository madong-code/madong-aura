import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

export const avatarVariant = cva(
  'bg-secondary text-foreground inline-flex shrink-0 items-center justify-center overflow-hidden font-normal select-none',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
      size: {
        base: 'size-16  text-2xl',
        lg: 'size-32  text-5xl',
        sm: 'size-10  text-xs',
      },
    },
  },
);

export type AvatarVariants = VariantProps<typeof avatarVariant>;
