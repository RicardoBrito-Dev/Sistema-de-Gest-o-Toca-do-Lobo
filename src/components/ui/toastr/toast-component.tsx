import * as React from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const typeValues = {
  success: {
    border: "border-secondary",
    color: "bg-secondary text-secondary",
    icon: <CheckCircle2 className="m-[-2px] h-[24px] w-[24px]" />,
  },
  error: {
    border: "border-negative",
    color: "bg-negative text-negative",
    icon: <XCircle className="m-[-2px] h-[24px] w-[24px]" />,
  },
  warning: {
    border: "border-alert",
    color: "bg-alert text-alert",
    icon: <AlertCircle className="m-[-2px] h-[24px] w-[24px]" />,
  },
  info: {
    border: "border-dark-700",
    color: "bg-dark-700 text-dark-700",
    icon: <Info className="m-[-2px] h-[24px] w-[24px]" />,
  },
} as const;

export interface ToastComponentProps {
  type: "info" | "success" | "error" | "warning";
  text: string;
  timeout?: number;
}

export const ToastComponent = ({
  type,
  text,
  timeout,
}: ToastComponentProps) => {
  const [display, setDisplay] = React.useState<boolean>(true);

  React.useEffect(() => {
    setTimeout(() => {
      handleClose();
    }, timeout ?? 4000);
  });

  const handleClose = () => {
    setDisplay(false);
  };

  return (
    <div
      className={`
        relative mt-[8px] flex min-h-[80px] w-[400px] justify-between rounded-[4px] border text-primary
        ${typeValues[type].border} ${display ? "right-0" : `fadeawayDisplay right-[-416px]`}
      `}
      style={{ transition: "right 500ms ease" }}
    >
      <div
        className={`flex w-[64px] items-center justify-center ${typeValues[type].color}`}
      >
        <div className="flex h-[20px] w-[20px] items-center rounded-[50%] bg-white">
          {typeValues[type].icon}
        </div>
      </div>

      <div
        className="flex w-full items-center pl-4 text-sm font-medium"
        style={{ fontFamily: "Helvetica Neue, Roboto, sans-serif" }}
      >
        <p>{text}</p>
      </div>

      <button
        type="button"
        className="flex w-[56px] cursor-pointer items-center justify-center text-[#948cab]"
        onClick={handleClose}
      >
        <X size={24} />
      </button>
    </div>
  );
};
