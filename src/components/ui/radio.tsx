import * as React from "react";
import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.RadioGroup>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.RadioGroup> & {
    label: string;
  }
>(({ className, label, children, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn("flex flex-col", className)}
    ref={ref}
    {...props}
  >
    <p className="mb-1 font-semibold text-dark opacity-80">{label}</p>
    {children}
  </RadioGroupPrimitive.Root>
));
RadioGroup.displayName = RadioGroupPrimitive.RadioGroup.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.RadioGroupItem>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.RadioGroupItem>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.RadioGroupItem
    className={cn(
      "size-5 rounded-full border border-primary border-opacity-40 data-[state=checked]:bg-primary",
      className,
    )}
    ref={ref}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex h-full items-center justify-center after:bg-white">
      <Check color="white" strokeWidth={6} size={12} />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.RadioGroupItem>
));
RadioGroupItem.displayName = RadioGroupPrimitive.RadioGroupItem.displayName;

export { RadioGroup, RadioGroupItem };
