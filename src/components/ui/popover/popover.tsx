import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "../popover";

export interface PopoverProps {
  title: React.ReactNode;
  text?: string;
  trigger: React.ReactNode;
  children?: React.ReactNode;
}

export const PopoverComponent = (props: PopoverProps) => {
  const { title, text, trigger, children } = props;

  return (
    <Popover>
      <PopoverTrigger asChild={typeof trigger !== "string"}>
        {trigger}
      </PopoverTrigger>

      <PopoverContent>
        <PopoverTitle>{title}</PopoverTitle>

        <div className="p-4">
          {text ? <p className="text-sm">{text}</p> : children}
        </div>
      </PopoverContent>
    </Popover>
  );
};
