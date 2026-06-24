import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export interface SidebarItemProps {
  text: string;
  icon: React.ReactNode;
  link: string;
  textColor?: string;
  activeColor?: string;
  isActive?: boolean;
  routerCallback?: (link: string) => void;
}

export const SidebarItem = ({
  text,
  icon,
  link,
  textColor,
  activeColor,
  isActive,
  routerCallback,
}: SidebarItemProps) => {
  const itemColorActive = isActive ? activeColor : textColor;

  const handleClick = () => {
    routerCallback ? routerCallback(link) : undefined;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex h-[32px] w-full cursor-pointer items-center gap-2 py-2 transition-colors hover:text-secondary-700",
        itemColorActive,
      )}
    >
      {icon}
      <Text variant="highlight" className="text-xs font-medium">
        {text}
      </Text>
    </button>
  );
};
