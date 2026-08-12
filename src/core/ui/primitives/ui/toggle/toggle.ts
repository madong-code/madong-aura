import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

export const toggleVariants = cva(
  'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground focus-visible:ring-ring hover:bg-muted hover:text-muted-foreground inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-3',
        lg: 'h-10 px-3',
        sm: 'h-8 px-2',
      },
      variant: {
        default: 'bg-transparent',
        outline:
          'border-input hover:bg-accent hover:text-accent-foreground border bg-transparent shadow-sm',
      },
    },
  },
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
