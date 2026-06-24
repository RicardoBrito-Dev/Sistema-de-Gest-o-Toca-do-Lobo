import type { LabelHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import * as Switch from "@radix-ui/react-switch";

export interface SwitchProps extends Switch.SwitchProps {
  rightBtnText?: ReactNode | string;
  leftBtnText?: ReactNode | string;
}

export interface LabelSwitchProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  text: string;
}

export const LabelSwitch = ({
  text,
  className,
  htmlFor,
  ...props
}: LabelSwitchProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "cursor-pointer text-xs font-medium leading-none text-primary",
        className,
      )}
      {...props}
    >
      {text}
    </label>
  );
};

export const BasicSwitch = ({
  rightBtnText,
  leftBtnText,
  id,
  ...props
}: SwitchProps) => {
  const defaultId = useId();
  const handleStatus = (value: boolean) => {
    if (!props.disabled) {
      props.onCheckedChange && props.onCheckedChange(value);
    }
  };
  const handleId = id ? id : defaultId;
  return (
    <div className="flex items-center">
      {typeof leftBtnText === "string" ? (
        <LabelSwitch htmlFor={handleId} className="mr-2" text={leftBtnText} />
      ) : (
        leftBtnText
      )}
      <SwitchRoot onCheckedChange={handleStatus} id={handleId} {...props} />
      {typeof rightBtnText === "string" ? (
        <LabelSwitch htmlFor={handleId} className="ml-2" text={rightBtnText} />
      ) : (
        rightBtnText
      )}
    </div>
  );
};

export const SwitchRoot = ({
  onCheckedChange,
  className,
  ...props
}: SwitchProps) => {
  const handleStatus = (value: boolean) => {
    if (!props.disabled) {
      onCheckedChange && onCheckedChange(value);
    }
  };

  return (
    <Switch.Root
      className={cn(
        "relative h-[20px] w-[37px] cursor-pointer rounded-full bg-dark-50  outline-none data-[disabled]:cursor-not-allowed data-[disabled]:bg-dark-50 data-[state=checked]:bg-secondary",
        className,
      )}
      checked={props.checked}
      onClick={() => {
        handleStatus(!props.checked);
      }}
      {...props}
    >
      <Switch.Thumb className=" block h-[17px] w-[17px] translate-x-0.5 rounded-full bg-dark-500 p-[2px]  transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[18px] data-[disabled]:bg-dark-500  data-[state=checked]:bg-white" />
    </Switch.Root>
  );
};
