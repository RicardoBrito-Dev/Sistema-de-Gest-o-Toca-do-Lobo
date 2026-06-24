import * as React from "react";
import { CircleUser } from "lucide-react";

import { Button } from "../button";
import { Text } from "../text";

interface HeaderProps {
  username: string;
  styleHeader?: string;
  styleButton?: string;
  buttonLabel?: string;
  children?: React.ReactNode;
}

export const Header = ({
  children,
  username,
  styleHeader,
  styleButton,
  buttonLabel = "Perfil",
}: HeaderProps) => {
  return (
    <header
      className={`flex h-[68px] w-full items-center justify-between border-b border-dark-50 px-8 text-primary ${styleHeader ?? ""}`}
    >
      <div>{children}</div>

      <div className="flex">
        <div className="flex flex-col items-end">
          <Text className="font-medium">{username}</Text>
          <div>
            <Button
              className={`h-6 rounded-[5px] bg-light px-2 text-primary ${styleButton ?? ""}`}
            >
              <Text className="text-xs font-medium">{buttonLabel}</Text>
            </Button>
          </div>
        </div>
        <div className="ml-4 flex items-center text-primary">
          <CircleUser size={40} strokeWidth={1} />
        </div>
      </div>
    </header>
  );
};
