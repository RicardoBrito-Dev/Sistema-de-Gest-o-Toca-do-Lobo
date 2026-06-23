import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "focus:ring-ring inline-flex items-center gap-1 rounded-sm border border-transparent px-1 font-body text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:p-0",
  {
    variants: {
      colorsVariant: {
        primary: "bg-primary-500 text-primary-700",
        negative: "bg-negative-50 text-negative-900",
        positive: "bg-positive-50 text-positive",
        alert: "bg-alert-500 text-alert-900",
        gray: "bg-dark-50 text-dark-700",
        steelblue: "bg-steelblue-200 text-steelblue-900",
      },
    },
    defaultVariants: {
      colorsVariant: "primary",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, colorsVariant, ...props }: BadgeProps) => {
  return (
    <div
      className={cn(badgeVariants({ colorsVariant }), className)}
      {...props}
    />
  );
};
