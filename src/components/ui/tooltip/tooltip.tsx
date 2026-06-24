import * as React from "react";
import { cn } from "@/lib/utils";
import {
  type TooltipContentProps,
  type TooltipProps as TooltipRootProps,
} from "@radix-ui/react-tooltip";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

export interface TooltipProps extends TooltipContentProps {
  root?: TooltipRootProps;
  text: React.ReactNode;
  children: React.ReactNode;
}

export const TooltipComponent = ({
  text,
  children,
  root,
  className,
  ...props
}: TooltipProps) => (
  <TooltipProvider>
    <Tooltip delayDuration={300} {...root}>
      <TooltipTrigger
        asChild={
          React.isValidElement(children) && children.type !== React.Fragment
        }
      >
        {children}
      </TooltipTrigger>

      <TooltipContent
        {...props}
        className={cn(
          "bg-gradient-to-b from-primary to-primary-700 text-white",
          className,
        )}
      >
        <p className="text-sm">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
