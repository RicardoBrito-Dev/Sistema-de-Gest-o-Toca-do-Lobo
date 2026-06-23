import type { VariantProps } from "class-variance-authority";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

const TextVariants = cva("text-sm font-normal", {
  variants: {
    variant: {
      body: "font-body",
      highlight: "font-highlight",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TextProps extends VariantProps<typeof TextVariants> {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  asChild,
  className,
  variant,
}: TextProps) => {
  const Comp = asChild ? Slot : "p";
  return (
    <Comp className={cn(TextVariants({ variant, className }))}>{children}</Comp>
  );
};
