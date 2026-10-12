import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'focus-visible:ring-ring inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'size-8  rounded-sm px-1 text-lg',
        lg: 'h-10 rounded-md px-4',
        sm: 'h-8 rounded-md px-2 text-xs',
        xs: 'size-8  rounded-sm px-1 text-xs',
      },
      variant: {
        default:
          'bg-primary hover:bg-primary/90 text-primary-foreground shadow',
        destructive:
          'bg-destructive hover:bg-destructive-hover text-destructive-foreground shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        heavy: 'hover:bg-heavy hover:text-heavy-foreground',
        icon: 'hover:bg-accent hover:text-accent-foreground text-foreground/80',
        link: 'text-primary underline-offset-4 hover:underline',
        outline:
          'bg-background border-input hover:bg-accent hover:text-accent-foreground border shadow-sm',
        secondary:
          'bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm',
      },
    },
  },
);
