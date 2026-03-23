import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("block text-sm font-medium text-espresso-700 mb-1.5", className)}
        {...props}
      >
        {children}
        {required && <span className="text-rust-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
