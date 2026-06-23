import type { Observable } from "rxjs";
import { Subject } from "rxjs";

import { type ToastComponentProps } from "./toast-component";

const toastSubject = new Subject<ToastComponentProps>();

export const ToastrService = {
  newToast: (toast: ToastComponentProps): void => {
    toastSubject.next(toast);
  },

  observeToast: (): Observable<ToastComponentProps> =>
    toastSubject.asObservable(),
};
