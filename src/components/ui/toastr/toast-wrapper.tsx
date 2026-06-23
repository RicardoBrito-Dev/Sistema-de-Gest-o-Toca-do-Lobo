import { useEffect, useState } from "react";

import type { ToastComponentProps } from "./toast-component";
import { ToastComponent } from "./toast-component";
import { ToastrService } from "./toastr.service";

export const ToastWrapper = () => {
  const [toastList, setToastList] = useState<ToastComponentProps[]>([]);

  useEffect(() => {
    const subscription = ToastrService.observeToast().subscribe(handleNewToast);
    return () => {
      subscription.unsubscribe();
    };
  });

  const handleNewToast = (newToast: ToastComponentProps) => {
    const list = [...toastList];
    list.push(newToast);
    setToastList(list);
  };

  return (
    <div className="fixed bottom-[8px] right-[8px] flex flex-col-reverse">
      {toastList.map((toast) => (
        <div key={toast.text}>
          <ToastComponent
            type={toast.type}
            text={toast.text}
            timeout={toast.timeout}
          />
        </div>
      ))}
    </div>
  );
};
