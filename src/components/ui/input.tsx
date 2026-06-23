import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Eye, EyeOff } from "lucide-react";

import { Text } from "./text";

export interface TextInputInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  messageError?: string | null;
  password?: boolean;
}

export interface TextInputRootProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactNode;
  label?: string;
  htmlFor?: string;
  error?: string | undefined;
  classNames?: {
    root?: string;
    label?: string;
    error?: string;
  };
}

export interface TextInputIconProps {
  className?: string;
  children: React.ReactNode;
}

const TextInputRoot = ({
  error = undefined,
  children,
  label,
  htmlFor,
  className,
  classNames,
}: TextInputRootProps) => {
  const border = error ? "border-negative" : "border-dark-500";
  return (
    <div
      className={cn("flex w-full flex-col items-start gap-1", classNames?.root)}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          "font-body text-sm font-medium text-primary",
          classNames?.label,
        )}
      >
        {label}
      </label>

      <div
        className={cn(
          "border-input flex w-full items-center gap-3 rounded-md border file:border-0 file:bg-transparent focus-within:border-primary-700 has-[:disabled]:border-dark-700 has-[:disabled]:bg-dark-50",
          border,
          className,
        )}
      >
        {children}
      </div>

      {error ? (
        <Text
          className={cn(
            "text-[11px] font-medium text-negative",
            classNames?.error,
          )}
        >
          {error}
        </Text>
      ) : null}
    </div>
  );
};
TextInputRoot.displayName = "TextInput.Root";

const TextInputIcon = ({ children, className }: TextInputIconProps) => (
  <Slot className={cn("mr-3 size-6 text-dark", className)}>{children}</Slot>
);
TextInputIcon.displayName = "TextInput.Icon";

const TextInputInput = React.forwardRef<HTMLInputElement, TextInputInputProps>(
  ({ className, password, ...props }, ref) => {
    const [isVisible, setIsVisivle] = React.useState(false);
    return (
      <>
        <input
          ref={ref}
          className={cn(
            "placeholder:text-muted-foreground text-body h-12 flex-1 bg-transparent px-3 py-2 text-sm outline-none file:text-sm file:font-medium",
            className,
          )}
          type={password && !isVisible ? "password" : props.type}
          {...props}
        />
        {password ? (
          <Slot
            onClick={() => {
              setIsVisivle(!isVisible);
            }}
            className="mr-3 size-6 cursor-pointer text-dark"
          >
            {!isVisible ? <Eye /> : <EyeOff />}
          </Slot>
        ) : null}
      </>
    );
  },
);
TextInputInput.displayName = "TextInput.Input";

export const TextInput = {
  Root: TextInputRoot,
  Input: TextInputInput,
  Icon: TextInputIcon,
};
