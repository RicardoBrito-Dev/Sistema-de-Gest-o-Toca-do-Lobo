import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  htmlFor?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, htmlFor, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col items-start">
        <label className="font-body text-sm text-dark" htmlFor={htmlFor}>
          {label}
        </label>
        <textarea
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground flex min-h-[113px] w-full resize-none rounded-md border border-dark-500 px-3 py-2 text-xs outline-none focus:border-secondary focus-visible:outline-none disabled:border-dark-700 disabled:bg-dark-50",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
