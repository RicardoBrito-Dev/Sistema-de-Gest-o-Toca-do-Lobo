import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DropdownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
}

export const Dropdown = ({ children, trigger, className }: DropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className={className}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
