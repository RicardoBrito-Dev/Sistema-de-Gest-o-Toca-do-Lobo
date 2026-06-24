import type { VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { ArrowRightCircle, RotateCw, XCircle } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { create } from "zustand";

import type { ButtonProps, buttonVariants } from "../button";
import { Button } from "../button";
import { Textarea } from "../textarea";
import { Modal } from "./modal";

interface ConfirmationModalButton
  extends Omit<ButtonProps, "children" | "onClick"> {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  colorVariant?: VariantProps<typeof buttonVariants>["colorVariant"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export type ConfirmationModalProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  cancelButton?: ConfirmationModalButton;
  confirmButton?: ConfirmationModalButton;
  onCancel?: () => void;
} & (
  | { onConfirm: () => Promise<void> | void }
  | {
      onConfirm: (value: string) => Promise<void> | void;
      question: {
        active: boolean;
        initialValue?: string;
        label?: string;
        required?: boolean;
      };
    }
);

interface UseConfirmationModal {
  isOpen: boolean;
  modalProps: ConfirmationModalProps;
  open: (modal: ConfirmationModalProps) => void;
  close: () => void;
}

export const useConfirmationModal = create<UseConfirmationModal>((set) => ({
  isOpen: false,
  modalProps: { title: "", onConfirm: () => undefined },
  open: (modal) => {
    set((state) => ({ ...state, modalProps: modal, isOpen: true }));
  },
  close: () => {
    set((state) => ({ ...state, isOpen: false }));
  },
}));

export const ConfirmationModal = () => {
  const { isOpen, close, modalProps } = useConfirmationModal();
  const [isLoading, setIsLoading] = useState(false);

  const isQuestionModal = "question" in modalProps;

  const isRequired = isQuestionModal
    ? modalProps.question.required ?? true
    : false;

  const { control, getValues, setValue } = useForm<{
    question: string;
  }>({
    defaultValues: {
      question: isQuestionModal ? modalProps.question.initialValue : "",
    },
  });

  const questionFieldValue = useWatch({ control, name: "question" });

  useEffect(() => {
    if (isQuestionModal && modalProps.question.initialValue) {
      setValue("question", modalProps.question.initialValue);
    }
  }, [isQuestionModal, modalProps, setValue]);

  const handleConfirm = async () => {
    const { question } = getValues();

    const result = modalProps.onConfirm(question);

    if (result instanceof Promise) {
      setIsLoading(true);
      await result;
      setIsLoading(false);
    }

    if (isQuestionModal) {
      setValue("question", modalProps.question.initialValue ?? "");
    }
  };

  const renderDescription = () => {
    if (!modalProps.description) return null;

    if (typeof modalProps.description !== "string")
      return modalProps.description;

    if (isQuestionModal)
      return <p className="text-gray-500">{modalProps.description}</p>;

    return (
      <p className="text-center text-gray-500">{modalProps.description}</p>
    );
  };

  return (
    <form noValidate>
      <Modal
        open={isOpen}
        setOpen={close}
        title={modalProps.title}
        className="flex flex-col gap-5"
        footer={
          <>
            <DialogClose asChild>
              <Button
                variant={modalProps.cancelButton?.variant ?? "outline"}
                colorVariant={
                  modalProps.cancelButton?.colorVariant ?? "negative"
                }
                {...modalProps.cancelButton}
                onClick={() => {
                  if (isQuestionModal) {
                    setValue("question", "");
                  }

                  if (modalProps.onCancel) {
                    modalProps.onCancel();
                  } else {
                    close();
                  }
                }}
              >
                {modalProps.cancelButton?.icon ?? (
                  <XCircle className="size-4" />
                )}
                {modalProps.cancelButton?.label ?? "Cancelar"}
              </Button>
            </DialogClose>

            <Button
              disabled={isLoading || (isRequired ? !questionFieldValue : false)}
              variant={modalProps.confirmButton?.variant ?? "primary"}
              colorVariant={modalProps.confirmButton?.colorVariant ?? null}
              {...modalProps.confirmButton}
              onClick={() => void handleConfirm()}
            >
              {isLoading ? (
                <RotateCw className="mr-2 size-4 animate-spin" />
              ) : null}

              {!isLoading && modalProps.confirmButton?.icon
                ? modalProps.confirmButton.icon
                : null}

              {!isLoading && !modalProps.confirmButton?.icon ? (
                <ArrowRightCircle className="size-4" />
              ) : null}

              {modalProps.confirmButton?.label ?? "Confirmar"}
            </Button>
          </>
        }
      >
        {isQuestionModal ? (
          <>
            {renderDescription()}

            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <Textarea
                  required
                  htmlFor="question"
                  label={modalProps.question.label}
                  {...field}
                />
              )}
            />
          </>
        ) : (
          renderDescription()
        )}
      </Modal>
    </form>
  );
};
