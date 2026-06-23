import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

import type { SidebarItemProps } from "./sidebar-item";
import { SidebarItem } from "./sidebar-item";

export interface SidebarDropdownProps {
  text: string;
  icon: React.ReactNode;
  routes?: SidebarItemProps[];
  textColor?: string;
  activeColor?: string;
  routerCallback?: (link: string) => void;
}

export const SidebarDropdown = (props: SidebarDropdownProps) => {
  const { text, icon, routes, textColor, activeColor, routerCallback } = props;
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const checkIfSUbMenuIsActive = routes?.find((subRoute) => subRoute.isActive);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="w-full py-2"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full cursor-pointer items-center justify-between transition-colors hover:text-secondary-700",
          checkIfSUbMenuIsActive ? activeColor : textColor,
        )}
      >
        <div className="flex h-[32px] items-center gap-2">
          {icon}
          <Text variant="highlight" className="text-xs font-medium">
            {text}
          </Text>
        </div>

        <span
          className={cn(
            "rotate-0 transform transition-transform",
            isExpanded ? "-rotate-90" : "",
          )}
        >
          <ChevronLeft />
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="CollapsibleContent">
        {routes?.map((route, index) => (
          <div key={route.text} className="flex max-h-[40px] pl-3">
            <div
              className={`
                relative w-[12px] bg-none ${index > 0 ? "top-[-32px] h-[56px]" : "h-[24px]"}
                mr-1 rounded-bl-lg border-b border-l ${textColor ?? ""}
              `}
            />
            <SidebarItem
              text={route.text}
              link={route.link}
              icon={route.icon}
              isActive={route.isActive}
              textColor={textColor}
              activeColor={activeColor}
              routerCallback={routerCallback}
            />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
