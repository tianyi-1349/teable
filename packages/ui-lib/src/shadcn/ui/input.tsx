import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { motionClassNames } from '../motion';
import { cn } from '../utils';

const inputVariants = cva(
  cn(
    'flex w-full rounded-md border border-border bg-background dark:bg-[color-mix(in_oklab,white_5%,hsl(var(--background)))] px-2 py-1 hover:border-primary/30 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
    motionClassNames.interactive,
    motionClassNames.focusRing
  ),
  {
    variants: {
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        xs: 'h-6 text-xs',
        lg: 'h-9 text-sm px-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => (
    <input type={type} className={cn(inputVariants({ size }), className)} ref={ref} {...props} />
  )
);
Input.displayName = 'Input';

export { Input };
