import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-95',
        outline: 'border border-input bg-transparent hover:bg-accent/5',
        ghost: 'bg-transparent hover:bg-accent/5',
        subtle: 'bg-muted text-foreground'
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  as?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, as: Component = 'button', ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(buttonVariants({ variant, size }), className)}
        {...(props as any)}
      />
    );
  }
);
Button.displayName = 'Button';
