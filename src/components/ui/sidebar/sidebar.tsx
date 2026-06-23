import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

import type { SidebarDropdownProps } from "./sidebar-dropdown";
import type { SidebarItemProps } from "./sidebar-item";
import { ScrollArea } from "../scroll-area";
import { SidebarDropdown } from "./sidebar-dropdown";
import { SidebarItem } from "./sidebar-item";

export interface SidebarProps {
  textColor?: string;
  activeColor?: string;
  items: (SidebarDropdownProps | SidebarItemProps)[];
  children: React.ReactNode;
  routerCallback: (link: string) => void;
  footer?: React.ReactNode;
  className?: string;
}

export const Sidebar = ({
  textColor = "text-white",
  activeColor = "text-secondary",
  items,
  routerCallback,
  children,
  footer,
  className,
}: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <nav
      className={cn(
        "relative flex h-screen flex-col space-y-4 bg-gradient-to-b from-primary to-primary-700 text-xs font-medium text-white shadow-[2px_0_30px_0_rgba(0,0,0,0.4)] transition-all duration-300 ease-linear",
        isExpanded ? "w-[240px] min-w-[240px] p-0" : "w-0 min-w-0 py-8 pr-1",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          // Temporariamente esconde o botão de expandir e recolher o menu até que a versão com icone esteja pronta
          "absolute left-full top-[40px] -ml-2 hidden size-4 transform rounded-full bg-white text-primary transition-all duration-300 ease-linear",
          isExpanded ? "-rotate-0" : "-ml-2 -rotate-180",
        )}
        onClick={() => {
          setIsExpanded((prev) => !prev);
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {children}

      <ScrollArea
        className="flex-1"
        scrollBarProps={{ className: "opacity-15" }}
      >
        <ul className="px-6">
          {items.map((item) => (
            <li key={item.text} className="overflow-hidden py-2">
              {"routes" in item ? (
                <SidebarDropdown
                  icon={item.icon}
                  text={item.text}
                  routes={item.routes}
                  textColor={textColor}
                  activeColor={activeColor}
                  routerCallback={routerCallback}
                />
              ) : null}

              {"link" in item ? (
                <SidebarItem
                  icon={item.icon}
                  text={item.text}
                  link={item.link}
                  textColor={textColor}
                  activeColor={activeColor}
                  isActive={item.isActive}
                  routerCallback={routerCallback}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </ScrollArea>

      {footer ? <div className="mx-6 border-t py-4">{footer}</div> : null}
    </nav>
  );
};
