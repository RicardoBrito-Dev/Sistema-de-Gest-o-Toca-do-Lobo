import type * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";

import { Checkbox } from "./checkbox";

export interface StatusSwitchProps extends CheckboxPrimitive.CheckboxProps {
  label?: string;
  leftBtnText?: string;
  rightBtnText?: string;
  setValue: (value: boolean) => void;
}

export const StatusSwitch = ({
  label = "Status",
  leftBtnText = "Ativo",
  rightBtnText = "Inativo",
  setValue,
  ...props
}: StatusSwitchProps) => {
  const { disabled, checked } = props;

  const handleStatus = (value: boolean) => {
    if (!props.disabled) setValue(value);
  };

  return (
    <>
      <label className="font-body text-sm font-medium text-primary">
        {label}
      </label>

      <Checkbox className="hidden" {...props} />

      <div
        className={cn(
          "flex w-[max-content] gap-2 rounded-[100px] border border-dark-700 p-1 text-sm font-medium",
          disabled && "text-dark-700",
        )}
      >
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "rounded-[100px] px-6 py-2",
            checked && "bg-secondary text-white",
          )}
          onClick={() => {
            handleStatus(true);
          }}
        >
          {leftBtnText}
        </button>

        <button
          type="button"
          disabled={disabled}
          className={cn(
            "rounded-[100px] px-6 py-2",
            !checked && "bg-negative text-white",
          )}
          onClick={() => {
            handleStatus(false);
          }}
        >
          {rightBtnText}
        </button>
      </div>
    </>
  );
};
