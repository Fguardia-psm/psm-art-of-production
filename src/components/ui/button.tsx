import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-ui text-sm font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/50 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-brass text-ink hover:bg-brass-bright shadow-sm border border-brass-dim/30",
        secondary:
          "bg-transparent text-parchment border border-parchment/25 hover:bg-parchment/10 hover:border-parchment/40",
        paper:
          "bg-ink text-parchment hover:bg-ink-soft border border-ink/80 shadow-sm",
        outline:
          "bg-transparent text-charcoal border border-charcoal/20 hover:border-brass/50 hover:text-ink",
        ghost:
          "bg-transparent text-charcoal-muted hover:text-charcoal hover:bg-charcoal/5",
        ember:
          "bg-ember text-parchment hover:bg-ember-soft border border-ember/40",
      },
      size: {
        default: "h-11 px-5 rounded-md",
        sm: "h-9 px-3.5 rounded-sm text-xs",
        lg: "h-12 px-7 rounded-lg text-base",
        xl: "h-14 px-8 rounded-lg text-base tracking-wide",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
