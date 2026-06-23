"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

type CheckboxProps = React.ComponentProps<typeof Checkbox>;

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "focus-visible:ring-ring group peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-white data-[state=indeterminate]:text-white",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="hidden h-4 w-4 group-data-[state=checked]:block" />
      <Minus className="hidden h-3 w-4 group-data-[state=indeterminate]:block" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

interface CheckboxWithLabelProps extends CheckboxProps {
  className?: string;
  children: React.ReactNode;
  position?: "start" | "end";
}

const CheckboxWithLabel = ({
  children,
  className,
  position = "end",
  id: customId,
  ...checkboxProps
}: CheckboxWithLabelProps) => {
  const randomId = React.useId();
  const id = customId ?? randomId;

  const comp =
    typeof children === "string" ? (
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
      >
        {children}
      </label>
    ) : (
      children
    );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {position === "start" && comp}

      <Checkbox {...checkboxProps} id={id} />

      {position === "end" && comp}
    </div>
  );
};

export {
  Checkbox,
  type CheckboxProps,
  CheckboxWithLabel,
  type CheckboxWithLabelProps,
};
