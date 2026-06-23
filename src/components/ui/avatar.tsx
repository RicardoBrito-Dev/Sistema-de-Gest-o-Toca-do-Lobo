import { cn } from "@/lib/utils";
import { User } from "lucide-react";

import { Text } from "./text";

export type AvatarProps = {
  className?: string;
} & (
  | { icon: React.ReactNode; initials?: never; urlImg?: never }
  | { icon?: never; initials: string; urlImg?: never }
  | { icon?: never; initials?: never; urlImg?: string }
);

const getInitials = (value?: string) => {
  if (!value) return "";

  let initials = "";
  const nameParts = value.split(" ");

  if (nameParts.length > 1) {
    initials =
      (nameParts.at(0)?.charAt(0) ?? "") + (nameParts.at(-1)?.charAt(0) ?? "");
  } else if (nameParts[0] && nameParts[0].length > 1) {
    initials = nameParts[0].charAt(0) + nameParts[0].charAt(1);
  } else {
    initials = nameParts[0]?.charAt(0) ?? "";
  }

  return initials;
};

export const Avatar = ({ className, urlImg, icon, initials }: AvatarProps) => {
  return (
    <div
      className={cn(
        " relative flex h-[1.875rem] w-[1.875rem] shrink-0 overflow-hidden rounded-full border-[1.5px] border-primary text-primary",
        className,
      )}
    >
      {urlImg ? (
        <img
          src={urlImg}
          alt="Avatar"
          className="aspect-square h-full w-full"
        />
      ) : (
        <>
          {initials ? (
            <Text className="bg-muted flex h-full w-full items-center justify-center rounded-full [&>svg]:stroke-[1.5px]">
              {getInitials(initials)}
            </Text>
          ) : (
            <span className="bg-muted flex h-full w-full items-center justify-center rounded-full [&>svg]:stroke-[1.5px]">
              {icon ? icon : <User />}
            </span>
          )}
        </>
      )}
    </div>
  );
};
