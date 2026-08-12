import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'border-border focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default:
          'bg-accent hover:bg-accent text-primary-foreground border-transparent shadow-sm',
        destructive:
          'bg-destructive hover:bg-destructive-hover text-destructive-foreground border-transparent shadow-sm',
        outline: 'text-foreground',
        secondary:
          'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-transparent',
      },
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
