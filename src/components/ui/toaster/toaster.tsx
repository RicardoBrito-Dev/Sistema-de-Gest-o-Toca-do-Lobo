import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toaster/toast";
import { useToast } from "@/components/ui/toaster/use-toast";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

type Variant = "success" | "error" | "warning" | "info";

const typeValues = {
  success: {
    color: "bg-secondary",
    icon: <CheckCircle2 className="m-[-2px] h-[24px] w-[24px]" />,
  },
  error: {
    color: "bg-negative",
    icon: <XCircle className="m-[-2px] h-[24px] w-[24px]" />,
  },
  warning: {
    color: "bg-alert",
    icon: <AlertCircle className="m-[-2px] h-[24px] w-[24px]" />,
  },
  info: {
    color: "bg-dark-700",
    icon: <Info className="m-[-2px] h-[24px] w-[24px]" />,
  },
} as const;

export const Toaster = () => {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const variant: Variant = props.variant ?? "success";
        return (
          <Toast key={id} {...props} className="p-0">
            <div
              className={`flex h-full w-[70px] items-center justify-center text-white ${typeValues[variant].color}`}
            >
              {typeValues[variant].icon}
            </div>
            <div className="flex-1">
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? (
                <ToastDescription>{description}</ToastDescription>
              ) : null}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
};
