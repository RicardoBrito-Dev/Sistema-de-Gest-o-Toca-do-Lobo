import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "focus-visible:ring-ring inline-flex max-h-11 items-center justify-center gap-1 rounded-3xl stroke-slate-200 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-0 bg-secondary text-white hover:bg-secondary/90",
        outline: "border bg-opacity-0",
        link: "text-secondary underline-offset-4 hover:underline",
        ghost: "font-normal text-primary",
      },
      colorVariant: {
        negative: "bg-negative text-white hover:bg-negative/90",
        clear: "bg-primary-200 text-primary hover:bg-light/90 ",
      },
      size: {
        default: "px-5 py-3",
        ghost: "px-0 py-0",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        colorVariant: "negative",
        className:
          "border-negative text-negative hover:bg-transparent hover:text-negative/90",
      },
      {
        variant: "outline",
        colorVariant: null,
        className:
          "border-secondary text-secondary hover:bg-transparent hover:text-secondary/90",
      },
      {
        variant: "link",
        colorVariant: "negative",
        className: "bg-transparent text-negative hover:bg-transparent",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
      colorVariant: null,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      colorVariant,
      className,
      variant,
      size,
      isLoading,
      asChild = false,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild && !isLoading ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ colorVariant, variant, size, className }),
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <div className="m-0 h-4 w-4 animate-spin rounded-full border-2 border-b-dark-50 border-l-dark-50 border-r-dark-50 border-t-transparent ease-linear" />
        ) : (
          props.children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
