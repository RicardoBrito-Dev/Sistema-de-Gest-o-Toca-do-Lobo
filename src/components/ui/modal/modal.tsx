import { cn } from "@/lib/utils";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";

import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../dialog";

export interface ModalProps {
  title: string | React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  triggerElement?: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  classNameDialogContentModal?: string;
}

export const Modal = ({
  title,
  children,
  triggerElement,
  open,
  setOpen,
  className,
  footer,
  classNameDialogContentModal,
}: ModalProps) => {
  // TODO: the gradient may not work
  const gradient = `linear-gradient(0deg, dark-50} -16.51%, white 50%), linear-gradient(0deg, dark-700}, dark-700})`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>

      <DialogContent
        className={cn("bg-white text-primary", classNameDialogContentModal)}
      >
        <DialogHeader
          className="rounded-t-xl border-b border-dark-700 p-6"
          style={{ background: gradient }}
        >
          <DialogTitle className="text-center text-2xl font-bold">
            {title}
          </DialogTitle>
        </DialogHeader>

        {typeof children === "string" ? (
          <p className="p-8 text-center text-xl font-medium">{children}</p>
        ) : null}

        {children && typeof children !== "string" ? (
          <div className={cn("p-8", className)}>{children}</div>
        ) : null}

        {footer ? (
          <DialogFooter
            className={cn(
              "flex-wrap gap-4 px-2 py-6",
              children && "border-t border-dark-500",
            )}
          >
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
