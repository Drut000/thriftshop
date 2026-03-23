import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full px-4 py-3 bg-cream-100 text-espresso-900",
          "border-2 border-cream-300 transition-colors duration-200",
          "placeholder:text-espresso-400",
          "hover:border-cream-400",
          "focus:border-espresso-500 focus:bg-cream-50 focus:outline-none",
          error && "border-rust-500 focus:border-rust-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
